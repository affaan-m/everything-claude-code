---
name: nodejs-keccak256
description: Node.js crypto.createHash('sha3-256') produces NIST SHA3, NOT Ethereum's Keccak-256. Using the wrong hash silently breaks address derivation, signature verification, function selectors, and all on-chain hash verification.
origin: community
---

# Node.js SHA3 ≠ Keccak-256

One of the most common silent bugs in Ethereum JavaScript tooling. Node.js `crypto` implements NIST SHA3, which **produces different output** than Ethereum's Keccak-256. No error is thrown — the hash just silently differs.

## When to Use

- Computing any hash for Ethereum: function selectors, event topics, EIP-712 type hashes, storage slot derivation, address-from-pubkey derivation
- Writing or reviewing any code that calls `crypto.createHash('sha3-256')` for blockchain use
- Verifying signatures, Merkle proofs, or on-chain commitments in JavaScript/TypeScript

## How It Works

Ethereum was built on Keccak-256 — the **pre-standardization** version of SHA3. NIST later modified the padding before standardizing SHA3. The two algorithms produce different digests for the same input.

```javascript
import crypto from 'crypto';
import { keccak256, toUtf8Bytes } from 'ethers';

const data = 'hello';

const nistSha3   = crypto.createHash('sha3-256').update(data).digest('hex');
const keccak     = keccak256(toUtf8Bytes(data)).slice(2);  // remove 0x

console.log(nistSha3 === keccak);  // false — SILENT MISMATCH
```

**Impact:** wrong function selectors, broken storage slot reads, failed EIP-712 signature verification, incorrect Ethereum address derivation from public keys.

## Examples

### ethers v6 (recommended)

```typescript
import { keccak256, toUtf8Bytes, solidityPackedKeccak256, id } from 'ethers';

// Hash raw bytes
const hash = keccak256(new Uint8Array([0x01, 0x02]));

// Hash a UTF-8 string
const hash2 = keccak256(toUtf8Bytes('hello'));

// Shorthand for keccak256(toUtf8Bytes(...)) — use for event topics / function selectors
const topic = id('Transfer(address,address,uint256)');

// Equivalent of abi.encodePacked(...) in Solidity
const packed = solidityPackedKeccak256(
    ['address', 'uint256'],
    ['0x742d35Cc6634C0532925a3b8D4C9B569890FaC1c', 100n]
);
```

### viem

```typescript
import { keccak256, toBytes, toHex } from 'viem';

const hash = keccak256(toBytes('hello'));
```

### web3.js

```javascript
// web3.utils.keccak256 — the primary Keccak-256 function
const hash = web3.utils.keccak256('hello');

// web3.utils.soliditySha3 — NOT a plain alias for keccak256.
// It applies Solidity's abi.encodePacked() before hashing,
// so soliditySha3('hello') !== keccak256('hello') for typed inputs.
const packed = web3.utils.soliditySha3(
    { type: 'address', value: '0x742d35Cc6634C0532925a3b8D4C9B569890FaC1c' },
    { type: 'uint256', value: '100' }
);
```

### js-sha3 (lightweight, no framework)

```javascript
import { keccak256 } from 'js-sha3';
const hash = keccak256('hello');  // hex WITHOUT 0x prefix
```

## Common On-Chain Hash Patterns

### Function Selector (first 4 bytes)

```typescript
import { id } from 'ethers';

// First 4 bytes of keccak256("transfer(address,uint256)")
const selector = id('transfer(address,uint256)').slice(0, 10);
// → '0xa9059cbb'
```

### EIP-712 Type Hash

```typescript
import { keccak256, toUtf8Bytes } from 'ethers';

const TYPE_HASH = keccak256(
    toUtf8Bytes('Transfer(address from,address to,uint256 value)')
);
```

### Storage Slot for a Mapping

```typescript
import { keccak256, AbiCoder } from 'ethers';

// slot for mapping(address => uint256) at storage slot 0
function getMappingSlot(key: string, mappingSlot: number): string {
    return keccak256(
        AbiCoder.defaultAbiCoder().encode(
            ['address', 'uint256'],
            [key, mappingSlot]
        )
    );
}
```

### Ethereum Address from Public Key

```typescript
import { keccak256 } from 'ethers';

// Last 20 bytes of keccak256(uncompressedPubKey[1:])
function pubkeyToAddress(pubkeyBytes: Uint8Array): string {
    const hash = keccak256(pubkeyBytes.slice(1));  // remove 0x04 prefix
    return '0x' + hash.slice(-40);
}
```

## Audit Your Codebase

```bash
# Find dangerous patterns — NIST SHA3 used where Keccak is needed
grep -rn "createHash.*sha3" --include="*.ts" --include="*.js" .

# Confirm all ethereum hashing uses keccak
grep -rn "keccak256" --include="*.ts" --include="*.js" . | grep -v node_modules
```

## Quick Reference

| Use case | Correct call |
|----------|-------------|
| Function selector | `id('funcName(type,...)')` then `.slice(0,10)` |
| Event topic | `id('EventName(type,...)')` |
| EIP-712 type hash | `keccak256(toUtf8Bytes(typeString))` |
| Merkle leaf | `keccak256(abiCoder.encode([...], [...]))` |
| Storage slot (mapping) | `keccak256(abiCoder.encode(['key_type','uint256'], [key, slot]))` |
| Address from pubkey | `keccak256(pubkeyBytes.slice(1)).slice(-40)` |
| **NEVER for Ethereum** | `crypto.createHash('sha3-256')` |
