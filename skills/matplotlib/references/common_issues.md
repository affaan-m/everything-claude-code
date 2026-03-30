# Matplotlib Common Issues and Solutions

Troubleshooting guide for frequently encountered matplotlib problems.

## Display and Backend Issues

### Issue: Plots Not Showing

**Problem:** `plt.show()` doesn't display anything

**Solutions:**
```python
# 1. Check if backend is properly set (for interactive use)
import matplotlib
print(matplotlib.get_backend())

# 2. Try different backends
matplotlib.use('TkAgg')  # or 'Qt5Agg', 'MacOSX'
import matplotlib.pyplot as plt

# 3. In Jupyter notebooks, use magic command
%matplotlib inline  # Static images
# or
%matplotlib widget  # Interactive plots

# 4. Ensure plt.show() is called
plt.plot([1, 2, 3])
plt.show()
```

### Issue: "RuntimeError: main thread is not in main loop"

**Problem:** Interactive mode issues with threading

**Solution:**
```python
# Switch to non-interactive backend
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

# Or turn off interactive mode
plt.ioff()
```

### Issue: Figures Not Updating Interactively

**Problem:** Changes not reflected in interactive windows

**Solution:**
```python
# Enable interactive mode
plt.ion()

# Draw after each change
plt.plot(x, y)
plt.draw()
plt.pause(0.001)  # Brief pause to update display
```

## Layout and Spacing Issues

### Issue: Overlapping Labels and Titles

**Problem:** Labels, titles, or tick labels overlap or get cut off

**Solutions:**
```python
# Solution 1: Constrained layout (RECOMMENDED)
fig, ax = plt.subplots(constrained_layout=True)

# Solution 2: Tight layout
fig, ax = plt.subplots()
plt.tight_layout()

# Solution 3: Adjust margins manually
plt.subplots_adjust(left=0.15, right=0.95, top=0.95, bottom=0.15)

# Solution 4: Save with bbox_inches='tight'
plt.savefig('figure.png', bbox_inches='tight')

# Solution 5: Rotate long tick labels
ax.set_xticklabels(labels, rotation=45, ha='right')
```

### Issue: Colorbar Affects Subplot Size

**Problem:** Adding colorbar shrinks the plot

**Solution:**
```python
# Solution 1: Use constrained layout
fig, ax = plt.subplots(constrained_layout=True)
im = ax.imshow(data)
plt.colorbar(im, ax=ax)

# Solution 2: Manually specify colorbar dimensions
from mpl_toolkits.axes_grid1 import make_axes_locatable
divider = make_axes_locatable(ax)
cax = divider.append_axes("right", size="5%", pad=0.05)
plt.colorbar(im, cax=cax)

# Solution 3: For multiple subplots, share colorbar
fig, axes = plt.subplots(1, 3, figsize=(15, 4))
for ax in axes:
    im = ax.imshow(data)
fig.colorbar(im, ax=axes.ravel().tolist(), shrink=0.95)
```

### Issue: Subplots Too Close Together

**Problem:** Multiple subplots overlapping

**Solution:**
```python
# Solution 1: Use constrained_layout
fig, axes = plt.subplots(2, 2, constrained_layout=True)

# Solution 2: Adjust spacing with subplots_adjust
fig, axes = plt.subplots(2, 2)
plt.subplots_adjust(hspace=0.4, wspace=0.4)

# Solution 3: Specify spacing in tight_layout
plt.tight_layout(h_pad=2.0, w_pad=2.0)
```

## Memory and Performance Issues

### Issue: Memory Leak with Multiple Figures

**Problem:** Memory usage grows when creating many figures

**Solution:**
```python
# Close figures explicitly
fig, ax = plt.subplots()
ax.plot(x, y)
plt.savefig('plot.png')
plt.close(fig)  # or plt.close('all')

# Clear current figure without closing
plt.clf()

# Clear current axes
plt.cla()
```

### Issue: Large File Sizes

**Problem:** Saved figures are too large

**Solutions:**
```python
# Solution 1: Reduce DPI
plt.savefig('figure.png', dpi=150)  # Instead of 300

# Solution 2: Use rasterization for complex plots
ax.plot(x, y, rasterized=True)

# Solution 3: Use vector format for simple plots
plt.savefig('figure.pdf')  # or .svg

# Solution 4: Compress PNG
plt.savefig('figure.png', dpi=300, optimize=True)
```

### Issue: Slow Plotting with Large Datasets

**Problem:** Plotting takes too long with many points

**Solutions:**
```python
# Solution 1: Downsample data
from scipy.signal import decimate
y_downsampled = decimate(y, 10)  # Keep every 10th point

# Solution 2: Use rasterization
ax.plot(x, y, rasterized=True)

# Solution 3: Use line simplification
ax.plot(x, y)
for line in ax.get_lines():
    line.set_rasterized(True)

# Solution 4: For scatter plots, consider hexbin or 2d histogram
ax.hexbin(x, y, gridsize=50, cmap='viridis')
```

## Font and Text Issues

### Issue: Font Warnings

**Problem:** "findfont: Font family [...] not found"

**Solutions:**
```python
# Solution 1: Use available fonts
from matplotlib.font_manager import findfont, FontProperties
print(findfont(FontProperties(family='sans-serif')))

# Solution 2: Rebuild font cache
import matplotlib.font_manager
matplotlib.font_manager._rebuild()

# Solution 3: Suppress warnings
import warnings
warnings.filterwarnings("ignore", category=UserWarning)

# Solution 4: Specify fallback fonts
plt.rcParams['font.sans-serif'] = ['Arial', 'DejaVu Sans', 'sans-serif']
```

### Issue: LaTeX Rendering Errors

**Problem:** Math text not rendering correctly

**Solutions:**
```python
# Solution 1: Use raw strings with r prefix
ax.set_xlabel(r'$\alpha$')  # Not '\alpha'

# Solution 2: Escape backslashes in regular strings
ax.set_xlabel('$\\alpha$')

# Solution 3: Disable LaTeX if not installed
plt.rcParams['text.usetex'] = False

# Solution 4: Use mathtext instead of full LaTeX
# Mathtext is always available, no LaTeX installation needed
ax.text(x, y, r'$\int_0^\infty e^{-x} dx$')
```

### Issue: Text Cut Off or Outside Figure

**Problem:** Labels or annotations appear outside figure bounds

**Solutions:**
```python
# Solution 1: Use bbox_inches='tight'
plt.savefig('figure.png', bbox_inches='tight')

# Solution 2: Adjust figure bounds
plt.subplots_adjust(left=0.15, right=0.85, top=0.85, bottom=0.15)

# Solution 3: Clip text to axes
ax.text(x, y, 'text', clip_on=True)

# Solution 4: Use constrained_layout
fig, ax = plt.subplots(constrained_layout=True)
```

## Color and Colormap Issues

### Issue: Colorbar Not Matching Plot

**Problem:** Colorbar shows different range than data

**Solution:**
```python
# Explicitly set vmin and vmax
im = ax.imshow(data, vmin=0, vmax=1, cmap='viridis')
plt.colorbar(im, ax=ax)

# Or use the same norm for multiple plots
import matplotlib.colors as mcolors
norm = mcolors.Normalize(vmin=data.min(), vmax=data.max())
im1 = ax1.imshow(data1, norm=norm, cmap='viridis')
im2 = ax2.imshow(data2, norm=norm, cmap='viridis')
```

### Issue: Colors Look Wrong

**Problem:** Unexpected colors in plots

**Solutions:**
```python
# Solution 1: Check color specification format
ax.plot(x, y, color='blue')  # Correct
ax.plot(x, y, color=(0, 0, 1))  # Correct RGB
ax.plot(x, y, color='#0000FF')  # Correct hex

# Solution 2: Verify colormap exists
print(plt.colormaps())  # List available colormaps

# Solution 3: For scatter plots, ensure c shape matches
ax.scatter(x, y, c=colors)  # colors should have same length as x, y

# Solution 4: Check if alpha is set correctly
ax.plot(x, y, alpha=1.0)  # 0=transparent, 1=opaque
```

### Issue: Reversed Colormap

**Problem:** Colormap direction is backwards

**Solution:**
```python
# Add _r suffix to reverse any colormap
ax.imshow(data, cmap='viridis_r')
```

## Axis and Scale Issues

### Issue: Axis Limits Not Working

**Problem:** `set_xlim` or `set_ylim` not taking effect

**Solutions:**
```python
# Solution 1: Set after plotting
ax.plot(x, y)
ax.set_xlim(0, 10)
ax.set_ylim(-1, 1)

# Solution 2: Disable autoscaling
ax.autoscale(False)
ax.set_xlim(0, 10)

# Solution 3: Use axis method
ax.axis([xmin, xmax, ymin, ymax])
```

### Issue: Log Scale with Zero or Negative Values

**Problem:** ValueError when using log scale with data ≤ 0

**Solutions:**
```python
# Solution 1: Filter out non-positive values
mask = (data > 0)
ax.plot(x[mask], data[mask])
ax.set_yscale('log')

# Solution 2: Use symlog for data with positive and negative values
ax.set_yscale('symlog')

# Solution 3: Add small offset
ax.plot(x, data + 1e-10)
ax.set_yscale('log')
```

### Issue: Dates Not Displaying Correctly

**Problem:** Date axis shows numbers instead of dates

**Solution:**
```python
import matplotlib.dates as mdates
import pandas as pd

# Convert to datetime if needed
dates = pd.to_datetime(date_strings)

ax.plot(dates, values)

# Format date axis
ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d'))
ax.xaxis.set_major_locator(mdates.DayLocator(interval=7))
plt.xticks(rotation=45)
```

## Legend Issues

### Issue: Legend Covers Data

**Problem:** Legend obscures important parts of plot

**Solutions:**
```python
# Solution 1: Use 'best' location
ax.legend(loc='best')

# Solution 2: Place outside plot area
ax.legend(bbox_to_anchor=(1.05, 1), loc='upper left')

# Solution 3: Make legend semi-transparent
ax.legend(framealpha=0.7)

# Solution 4: Put legend below plot
ax.legend(bbox_to_anchor=(0.5, -0.15), loc='upper center', ncol=3)
```

### Issue: Too Many Items in Legend

**Problem:** Legend is cluttered with many entries

**Solutions:**
```python
# Solution 1: Only label selected items
for i, (x, y) in enumerate(data):
    label = f'Data {i}' if i % 5 == 0 else None
    ax.plot(x, y, label=label)

# Solution 2: Use multiple columns
ax.legend(ncol=3)

# Solution 3: Create custom legend with fewer entries
from matplotlib.lines import Line2D
custom_lines = [Line2D([0], [0], color='r'),
                Line2D([0], [0], color='b')]
ax.legend(custom_lines, ['Category A', 'Category B'])

# Solution 4: Use separate legend figure
fig_leg = plt.figure(figsize=(3, 2))
ax_leg = fig_leg.add_subplot(111)
ax_leg.legend(*ax.get_legend_handles_labels(), loc='center')
ax_leg.axis('off')
```

## 3D Plot Issues

### Issue: 3D Plots Look Flat

**Problem:** Difficult to perceive depth in 3D plots

**Solutions:**
```python
# Solution 1: Adjust viewing angle
ax.view_init(elev=30, azim=45)

# Solution 2: Add gridlines
ax.grid(True)

# Solution 3: Use color for depth
scatter = ax.scatter(x, y, z, c=z, cmap='viridis')

# Solution 4: Rotate interactively (if using interactive backend)
# User can click and drag to rotate
```

### Issue: 3D Axis Labels Cut Off

**Problem:** 3D axis labels appear outside figure

**Solution:**
```python
from mpl_toolkits.mplot3d import Axes3D

fig = plt.figure(figsize=(10, 8))
ax = fig.add_subplot(111, projection='3d')
ax.plot_surface(X, Y, Z)

# Add padding
fig.tight_layout(pad=3.0)

# Or save with tight bounding box
plt.savefig('3d_plot.png', bbox_inches='tight', pad_inches=0.5)
```

## Image and Colorbar Issues

### Issue: Images Appear Flipped

**Problem:** Image orientation is wrong

**Solution:**
```python
# Set origin parameter
ax.imshow(img, origin='lower')  # or 'upper' (default)

# Or flip array
ax.imshow(np.flipud(img))
```

### Issue: Images Look Pixelated

**Problem:** Image appears blocky when zoomed

**Solutions:**
```python
# Solution 1: Use interpolation
ax.imshow(img, interpolation='bilinear')
# Options: 'nearest', 'bilinear', 'bicubic', 'spline16', 'spline36', etc.

# Solution 2: Increase DPI when saving
plt.savefig('figure.png', dpi=300)

# Solution 3: Use vector format if appropriate
plt.savefig('figure.pdf')
```

## Common Errors and Fixes

### "TypeError: 'AxesSubplot' object is not subscriptable"

**Problem:** Trying to index single axes
```python
# Wrong
fig, ax = plt.subplots()
ax[0].plot(x, y)  # Error!

# Correct
fig, ax = plt.subplots()
ax.plot(x, y)
```

### "ValueError: x and y must have same first dimension"

**Problem:** Data arrays have mismatched lengths
```python
# Check shapes
print(f"x shape: {x.shape}, y shape: {y.shape}")

# Ensure they match
assert len(x) == len(y), "x and y must have same length"
```

### "AttributeError: 'numpy.ndarray' object has no attribute 'plot'"

**Problem:** Calling plot on array instead of axes
```python
# Wrong
data.plot(x, y)

# Correct
ax.plot(x, y)
# or for pandas
data.plot(ax=ax)
```

## Best Practices to Avoid Issues

1. **Always use the OO interface** - Avoid pyplot state machine
   ```python
   fig, ax = plt.subplots()  # Good
   ax.plot(x, y)
   ```

2. **Use constrained_layout** - Prevents overlap issues
   ```python
   fig, ax = plt.subplots(constrained_layout=True)
   ```

3. **Close figures explicitly** - Prevents memory leaks
   ```python
   plt.close(fig)
   ```

4. **Set figure size at creation** - Better than resizing later
   ```python
   fig, ax = plt.subplots(figsize=(10, 6))
   ```

5. **Use raw strings for math text** - Avoids escape issues
   ```python
   ax.set_xlabel(r'$\alpha$')
   ```

6. **Check data shapes before plotting** - Catch size mismatches early
   ```python
   assert len(x) == len(y)
   ```

7. **Use appropriate DPI** - 300 for print, 150 for web
   ```python
   plt.savefig('figure.png', dpi=300)
   ```

8. **Test with different backends** - If display issues occur
   ```python
   import matplotlib
   matplotlib.use('TkAgg')
   ```
