#!/usr/bin/env python3
"""
System Resource Detection Script

Detects available compute resources including CPU, GPU, memory, and disk space.
Outputs a JSON file that Claude Code can use to make informed decisions about
computational approaches (e.g., whether to use Dask, Zarr, Joblib, etc.).

Supports: macOS, Linux, Windows
GPU Detection: NVIDIA (CUDA), AMD (ROCm), Apple Silicon (Metal)
"""

import json
import os
import platform
import psutil
import subprocess
import sys
from pathlib import Path
from typing import Dict, List, Any, Optional


def get_cpu_info() -> Dict[str, Any]:
    """Detect CPU information."""
    cpu_info = {
        "physical_cores": psutil.cpu_count(logical=False),
        "logical_cores": psutil.cpu_count(logical=True),
        "max_frequency_mhz": None,
        "architecture": platform.machine(),
        "processor": platform.processor(),
    }

    # Get CPU frequency if available
    try:
        freq = psutil.cpu_freq()
        if freq:
            cpu_info["max_frequency_mhz"] = freq.max
            cpu_info["current_frequency_mhz"] = freq.current
    except Exception:
        pass

    return cpu_info


def get_memory_info() -> Dict[str, Any]:
    """Detect memory information."""
    mem = psutil.virtual_memory()
    swap = psutil.swap_memory()

    return {
        "total_gb": round(mem.total / (1024**3), 2),
        "available_gb": round(mem.available / (1024**3), 2),
        "used_gb": round(mem.used / (1024**3), 2),
        "percent_used": mem.percent,
        "swap_total_gb": round(swap.total / (1024**3), 2),
        "swap_available_gb": round((swap.total - swap.used) / (1024**3), 2),
    }


def get_disk_info(path: str = None) -> Dict[str, Any]:
    """Detect disk space information for working directory or specified path."""
    if path is None:
        path = os.getcwd()

    try:
        disk = psutil.disk_usage(path)
        return {
            "path": path,
            "total_gb": round(disk.total / (1024**3), 2),
            "available_gb": round(disk.free / (1024**3), 2),
            "used_gb": round(disk.used / (1024**3), 2),
            "percent_used": disk.percent,
        }
    except Exception as e:
        return {
            "path": path,
            "error": str(e),
        }


def detect_nvidia_gpus() -> List[Dict[str, Any]]:
    """Detect NVIDIA GPUs using nvidia-smi."""
    gpus = []

    try:
        # Try to run nvidia-smi
        result = subprocess.run(
            ["nvidia-smi", "--query-gpu=index,name,memory.total,memory.free,driver_version,compute_cap",
             "--format=csv,noheader,nounits"],
            capture_output=True,
            text=True,
            timeout=5
        )

        if result.returncode == 0:
            for line in result.stdout.strip().split('\n'):
                if line:
                    parts = [p.strip() for p in line.split(',')]
                    if len(parts) >= 6:
                        gpus.append({
                            "index": int(parts[0]),
                            "name": parts[1],
                            "memory_total_mb": float(parts[2]),
                            "memory_free_mb": float(parts[3]),
                            "driver_version": parts[4],
                            "compute_capability": parts[5],
                            "type": "NVIDIA",
                            "backend": "CUDA"
                        })
    except (subprocess.TimeoutExpired, FileNotFoundError, Exception):
        pass

    return gpus


def detect_amd_gpus() -> List[Dict[str, Any]]:
    """Detect AMD GPUs using rocm-smi."""
    gpus = []

    try:
        # Try to run rocm-smi
        result = subprocess.run(
            ["rocm-smi", "--showid", "--showmeminfo", "vram"],
            capture_output=True,
            text=True,
            timeout=5
        )

        if result.returncode == 0:
            # Parse rocm-smi output (basic parsing, may need refinement)
            lines = result.stdout.strip().split('\n')
            gpu_index = 0
            for line in lines:
                if 'GPU' in line and 'DID' in line:
                    gpus.append({
                        "index": gpu_index,
                        "name": "AMD GPU",
                        "type": "AMD",
                        "backend": "ROCm",
                        "info": line.strip()
                    })
                    gpu_index += 1
    except (subprocess.TimeoutExpired, FileNotFoundError, Exception):
        pass

    return gpus


def detect_apple_silicon_gpu() -> Optional[Dict[str, Any]]:
    """Detect Apple Silicon GPU (M1/M2/M3/etc.)."""
    if platform.system() != "Darwin":
        return None

    try:
        # Check if running on Apple Silicon
        result = subprocess.run(
            ["sysctl", "-n", "machdep.cpu.brand_string"],
            capture_output=True,
            text=True,
            timeout=5
        )

        cpu_brand = result.stdout.strip()

        # Check for Apple Silicon (M1, M2, M3, etc.)
        if "Apple" in cpu_brand and any(chip in cpu_brand for chip in ["M1", "M2", "M3", "M4"]):
            # Get GPU core count if possible
            gpu_info = {
                "name": cpu_brand,
                "type": "Apple Silicon",
                "backend": "Metal",
                "unified_memory": True,  # Apple Silicon uses unified memory
            }

            # Try to get GPU core information
            try:
                result = subprocess.run(
                    ["system_profiler", "SPDisplaysDataType"],
                    capture_output=True,
                    text=True,
                    timeout=10
                )

                # Parse GPU core info from system_profiler
                for line in result.stdout.split('\n'):
                    if 'Chipset Model' in line:
                        gpu_info["chipset"] = line.split(':')[1].strip()
                    elif 'Total Number of Cores' in line:
                        try:
                            cores = line.split(':')[1].strip()
                            gpu_info["gpu_cores"] = cores
                        except:
                            pass
            except Exception:
                pass

            return gpu_info
    except Exception:
        pass

    return None


def get_gpu_info() -> Dict[str, Any]:
    """Detect all available GPUs."""
    gpu_info = {
        "nvidia_gpus": detect_nvidia_gpus(),
        "amd_gpus": detect_amd_gpus(),
        "apple_silicon": detect_apple_silicon_gpu(),
        "total_gpus": 0,
        "available_backends": []
    }

    # Count total GPUs and available backends
    if gpu_info["nvidia_gpus"]:
        gpu_info["total_gpus"] += len(gpu_info["nvidia_gpus"])
        gpu_info["available_backends"].append("CUDA")

    if gpu_info["amd_gpus"]:
        gpu_info["total_gpus"] += len(gpu_info["amd_gpus"])
        gpu_info["available_backends"].append("ROCm")

    if gpu_info["apple_silicon"]:
        gpu_info["total_gpus"] += 1
        gpu_info["available_backends"].append("Metal")

    return gpu_info


def get_os_info() -> Dict[str, Any]:
    """Get operating system information."""
    return {
        "system": platform.system(),
        "release": platform.release(),
        "version": platform.version(),
        "machine": platform.machine(),
        "python_version": platform.python_version(),
    }


def detect_all_resources(output_path: str = None) -> Dict[str, Any]:
    """
    Detect all system resources and save to JSON.

    Args:
        output_path: Optional path to save JSON. Defaults to .claude_resources.json in cwd.

    Returns:
        Dictionary containing all resource information.
    """
    if output_path is None:
        output_path = os.path.join(os.getcwd(), ".claude_resources.json")

    resources = {
        "timestamp": __import__("datetime").datetime.now().isoformat(),
        "os": get_os_info(),
        "cpu": get_cpu_info(),
        "memory": get_memory_info(),
        "disk": get_disk_info(),
        "gpu": get_gpu_info(),
    }

    # Add computational recommendations
    resources["recommendations"] = generate_recommendations(resources)

    # Save to JSON file
    with open(output_path, 'w') as f:
        json.dump(resources, f, indent=2)

    return resources


def generate_recommendations(resources: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate computational approach recommendations based on available resources.
    """
    recommendations = {
        "parallel_processing": {},
        "memory_strategy": {},
        "gpu_acceleration": {},
        "large_data_handling": {}
    }

    # CPU recommendations
    cpu_cores = resources["cpu"]["logical_cores"]
    if cpu_cores >= 8:
        recommendations["parallel_processing"]["strategy"] = "high_parallelism"
        recommendations["parallel_processing"]["suggested_workers"] = max(cpu_cores - 2, 1)
        recommendations["parallel_processing"]["libraries"] = ["joblib", "multiprocessing", "dask"]
    elif cpu_cores >= 4:
        recommendations["parallel_processing"]["strategy"] = "moderate_parallelism"
        recommendations["parallel_processing"]["suggested_workers"] = max(cpu_cores - 1, 1)
        recommendations["parallel_processing"]["libraries"] = ["joblib", "multiprocessing"]
    else:
        recommendations["parallel_processing"]["strategy"] = "sequential"
        recommendations["parallel_processing"]["note"] = "Limited cores, prefer sequential processing"

    # Memory recommendations
    available_memory_gb = resources["memory"]["available_gb"]
    total_memory_gb = resources["memory"]["total_gb"]

    if available_memory_gb < 4:
        recommendations["memory_strategy"]["strategy"] = "memory_constrained"
        recommendations["memory_strategy"]["libraries"] = ["zarr", "dask", "h5py"]
        recommendations["memory_strategy"]["note"] = "Use out-of-core processing for large datasets"
    elif available_memory_gb < 16:
        recommendations["memory_strategy"]["strategy"] = "moderate_memory"
        recommendations["memory_strategy"]["libraries"] = ["dask", "zarr"]
        recommendations["memory_strategy"]["note"] = "Consider chunking for datasets > 2GB"
    else:
        recommendations["memory_strategy"]["strategy"] = "memory_abundant"
        recommendations["memory_strategy"]["note"] = "Can load most datasets into memory"

    # GPU recommendations
    gpu_info = resources["gpu"]
    if gpu_info["total_gpus"] > 0:
        recommendations["gpu_acceleration"]["available"] = True
        recommendations["gpu_acceleration"]["backends"] = gpu_info["available_backends"]

        if "CUDA" in gpu_info["available_backends"]:
            recommendations["gpu_acceleration"]["suggested_libraries"] = [
                "pytorch", "tensorflow", "jax", "cupy", "rapids"
            ]
        elif "Metal" in gpu_info["available_backends"]:
            recommendations["gpu_acceleration"]["suggested_libraries"] = [
                "pytorch-mps", "tensorflow-metal", "jax-metal"
            ]
        elif "ROCm" in gpu_info["available_backends"]:
            recommendations["gpu_acceleration"]["suggested_libraries"] = [
                "pytorch-rocm", "tensorflow-rocm"
            ]
    else:
        recommendations["gpu_acceleration"]["available"] = False
        recommendations["gpu_acceleration"]["note"] = "No GPU detected, use CPU-based libraries"

    # Large data handling recommendations
    disk_available_gb = resources["disk"]["available_gb"]
    if disk_available_gb < 10:
        recommendations["large_data_handling"]["strategy"] = "disk_constrained"
        recommendations["large_data_handling"]["note"] = "Limited disk space, use streaming or compression"
    elif disk_available_gb < 100:
        recommendations["large_data_handling"]["strategy"] = "moderate_disk"
        recommendations["large_data_handling"]["libraries"] = ["zarr", "h5py", "parquet"]
    else:
        recommendations["large_data_handling"]["strategy"] = "disk_abundant"
        recommendations["large_data_handling"]["note"] = "Sufficient space for large intermediate files"

    return recommendations


def main():
    """Main entry point for CLI usage."""
    import argparse

    parser = argparse.ArgumentParser(
        description="Detect system resources for scientific computing"
    )
    parser.add_argument(
        "-o", "--output",
        default=".claude_resources.json",
        help="Output JSON file path (default: .claude_resources.json)"
    )
    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="Print resources to stdout"
    )

    args = parser.parse_args()

    print("🔍 Detecting system resources...")
    resources = detect_all_resources(args.output)

    print(f"✅ Resources detected and saved to: {args.output}")

    if args.verbose:
        print("\n" + "="*60)
        print(json.dumps(resources, indent=2))
        print("="*60)

    # Print summary
    print("\n📊 Resource Summary:")
    print(f"  OS: {resources['os']['system']} {resources['os']['release']}")
    print(f"  CPU: {resources['cpu']['logical_cores']} cores ({resources['cpu']['physical_cores']} physical)")
    print(f"  Memory: {resources['memory']['total_gb']} GB total, {resources['memory']['available_gb']} GB available")
    print(f"  Disk: {resources['disk']['total_gb']} GB total, {resources['disk']['available_gb']} GB available")

    if resources['gpu']['total_gpus'] > 0:
        print(f"  GPU: {resources['gpu']['total_gpus']} detected ({', '.join(resources['gpu']['available_backends'])})")
    else:
        print("  GPU: None detected")

    print("\n💡 Recommendations:")
    recs = resources['recommendations']
    print(f"  Parallel Processing: {recs['parallel_processing'].get('strategy', 'N/A')}")
    print(f"  Memory Strategy: {recs['memory_strategy'].get('strategy', 'N/A')}")
    print(f"  GPU Acceleration: {'Available' if recs['gpu_acceleration'].get('available') else 'Not Available'}")


if __name__ == "__main__":
    main()
