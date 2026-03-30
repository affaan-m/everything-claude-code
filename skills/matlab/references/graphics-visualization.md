# Graphics and Visualization Reference

## Table of Contents
1. [2D Plotting](#2d-plotting)
2. [3D Plotting](#3d-plotting)
3. [Specialized Plots](#specialized-plots)
4. [Figure Management](#figure-management)
5. [Customization](#customization)
6. [Exporting and Saving](#exporting-and-saving)

## 2D Plotting

### Line Plots

```matlab
% Basic line plot
plot(y);                        % Plot y vs index
plot(x, y);                     % Plot y vs x
plot(x, y, 'r-');               % Red solid line
plot(x, y, 'b--o');             % Blue dashed with circles

% Line specification: [color][marker][linestyle]
% Colors: r g b c m y k w (red, green, blue, cyan, magenta, yellow, black, white)
% Markers: o + * . x s d ^ v > < p h
% Lines: - -- : -.

% Multiple datasets
plot(x1, y1, x2, y2, x3, y3);
plot(x, [y1; y2; y3]');         % Columns as separate lines

% With properties
plot(x, y, 'LineWidth', 2, 'Color', [0.5 0.5 0.5]);
plot(x, y, 'Marker', 'o', 'MarkerSize', 8, 'MarkerFaceColor', 'r');

% Get handle for later modification
h = plot(x, y);
h.LineWidth = 2;
h.Color = 'red';
```

### Scatter Plots

```matlab
scatter(x, y);                  % Basic scatter
scatter(x, y, sz);              % With marker size
scatter(x, y, sz, c);           % With color
scatter(x, y, sz, c, 'filled'); % Filled markers

% sz: scalar or vector (marker sizes)
% c: color spec, scalar, vector (colormap), or RGB matrix

% Properties
scatter(x, y, 'MarkerEdgeColor', 'b', 'MarkerFaceColor', 'r');
```

### Bar Charts

```matlab
bar(y);                         % Vertical bars
bar(x, y);                      % At specified x positions
barh(y);                        % Horizontal bars

% Grouped and stacked
bar(Y);                         % Each column is a group
bar(Y, 'stacked');              % Stacked bars

% Properties
bar(y, 'FaceColor', 'b', 'EdgeColor', 'k', 'LineWidth', 1.5);
bar(y, 0.5);                    % Bar width (0 to 1)
```

### Area Plots

```matlab
area(y);                        % Filled area under curve
area(x, y);
area(Y);                        % Stacked areas
area(Y, 'FaceAlpha', 0.5);      % Transparent
```

### Histograms

```matlab
histogram(x);                   % Automatic bins
histogram(x, nbins);            % Number of bins
histogram(x, edges);            % Specified edges
histogram(x, 'BinWidth', w);    % Bin width

% Normalization
histogram(x, 'Normalization', 'probability');
histogram(x, 'Normalization', 'pdf');
histogram(x, 'Normalization', 'count');  % default

% 2D histogram
histogram2(x, y);
histogram2(x, y, 'DisplayStyle', 'tile');
histogram2(x, y, 'FaceColor', 'flat');
```

### Error Bars

```matlab
errorbar(x, y, err);            % Symmetric error
errorbar(x, y, neg, pos);       % Asymmetric error
errorbar(x, y, yneg, ypos, xneg, xpos);  % X and Y errors

% Horizontal
errorbar(x, y, err, 'horizontal');

% With line style
errorbar(x, y, err, 'o-', 'LineWidth', 1.5);
```

### Logarithmic Plots

```matlab
semilogy(x, y);                 % Log y-axis
semilogx(x, y);                 % Log x-axis
loglog(x, y);                   % Both axes log
```

### Polar Plots

```matlab
polarplot(theta, rho);          % Polar coordinates
polarplot(theta, rho, 'r-o');   % With line spec

% Customize polar axes
pax = polaraxes;
pax.ThetaDir = 'clockwise';
pax.ThetaZeroLocation = 'top';
```

## 3D Plotting

### Line and Scatter

```matlab
% 3D line plot
plot3(x, y, z);
plot3(x, y, z, 'r-', 'LineWidth', 2);

% 3D scatter
scatter3(x, y, z);
scatter3(x, y, z, sz, c, 'filled');
```

### Surface Plots

```matlab
% Create grid first
[X, Y] = meshgrid(-2:0.1:2, -2:0.1:2);
Z = X.^2 + Y.^2;

% Surface plot
surf(X, Y, Z);                  % Surface with edges
surf(Z);                        % Use indices as X, Y

% Surface properties
surf(X, Y, Z, 'FaceColor', 'interp', 'EdgeColor', 'none');
surf(X, Y, Z, 'FaceAlpha', 0.5);  % Transparent

% Mesh plot (wireframe)
mesh(X, Y, Z);
mesh(X, Y, Z, 'FaceColor', 'none');

% Surface with contour below
surfc(X, Y, Z);
meshc(X, Y, Z);
```

### Contour Plots

```matlab
contour(X, Y, Z);               % 2D contour
contour(X, Y, Z, n);            % n contour levels
contour(X, Y, Z, levels);       % Specific levels
contourf(X, Y, Z);              % Filled contours

[C, h] = contour(X, Y, Z);
clabel(C, h);                   % Add labels

% 3D contour
contour3(X, Y, Z);
```

### Other 3D Plots

```matlab
% Bar3
bar3(Z);                        % 3D bar chart
bar3(Z, 'stacked');

% Pie3
pie3(X);                        % 3D pie chart

% Waterfall
waterfall(X, Y, Z);             % Like mesh with no back lines

% Ribbon
ribbon(Y);                      % 3D ribbon

% Stem3
stem3(x, y, z);                 % 3D stem plot
```

### View and Lighting

```matlab
% Set view angle
view(az, el);                   % Azimuth, elevation
view(2);                        % Top-down (2D view)
view(3);                        % Default 3D view
view([1 1 1]);                  % View from direction

% Lighting
light;                          % Add light source
light('Position', [1 0 1]);
lighting gouraud;               % Smooth lighting
lighting flat;                  % Flat shading
lighting none;                  % No lighting

% Material properties
material shiny;
material dull;
material metal;

% Shading
shading flat;                   % One color per face
shading interp;                 % Interpolated colors
shading faceted;                % With edges (default)
```

## Specialized Plots

### Statistical Plots

```matlab
% Box plot
boxplot(data);
boxplot(data, groups);          % Grouped
boxplot(data, 'Notch', 'on');   % With notches

% Violin plot (R2023b+)
violinplot(data);

% Heatmap
heatmap(data);
heatmap(xLabels, yLabels, data);
heatmap(T, 'XVariable', 'Col1', 'YVariable', 'Col2', 'ColorVariable', 'Val');

% Parallel coordinates
parallelplot(data);
```

### Image Display

```matlab
% Display image
imshow(img);                    % Auto-scaled
imshow(img, []);                % Scale to full range
imshow(img, [low high]);        % Specify display range

% Image as plot
image(C);                       % Direct indexed colors
imagesc(data);                  % Scaled colors
imagesc(data, [cmin cmax]);     % Specify color limits

% Colormap for imagesc
imagesc(data);
colorbar;
colormap(jet);
```

### Quiver and Stream

```matlab
% Vector field
[X, Y] = meshgrid(-2:0.5:2);
U = -Y;
V = X;
quiver(X, Y, U, V);             % 2D arrows
quiver3(X, Y, Z, U, V, W);      % 3D arrows

% Streamlines
streamline(X, Y, U, V, startx, starty);
```

### Pie and Donut

```matlab
pie(X);                         % Pie chart
pie(X, explode);                % Explode slices (logical)
pie(X, labels);                 % With labels

% Donut (using patch or workaround)
pie(X);
% Add white circle in center for donut effect
```

## Figure Management

### Creating Figures

```matlab
figure;                         % New figure window
figure(n);                      % Figure with number n
fig = figure;                   % Get handle
fig = figure('Name', 'My Figure', 'Position', [100 100 800 600]);

% Figure properties
fig.Color = 'white';
fig.Units = 'pixels';
fig.Position = [left bottom width height];
```

### Subplots

```matlab
subplot(m, n, p);               % m×n grid, position p
subplot(2, 2, 1);               % Top-left of 2×2

% Spanning multiple positions
subplot(2, 2, [1 2]);           % Top row

% With gap control
tiledlayout(2, 2);              % Modern alternative
nexttile;
plot(x1, y1);
nexttile;
plot(x2, y2);

% Tile spanning
nexttile([1 2]);                % Span 2 columns
```

### Hold and Overlay

```matlab
hold on;                        % Keep existing, add new plots
plot(x1, y1);
plot(x2, y2);
hold off;                       % Release

% Alternative
hold(ax, 'on');
hold(ax, 'off');
```

### Multiple Axes

```matlab
% Two y-axes
yyaxis left;
plot(x, y1);
ylabel('Left Y');
yyaxis right;
plot(x, y2);
ylabel('Right Y');

% Linked axes
ax1 = subplot(2,1,1); plot(x, y1);
ax2 = subplot(2,1,2); plot(x, y2);
linkaxes([ax1, ax2], 'x');      % Link x-axes
```

### Current Objects

```matlab
gcf;                            % Current figure handle
gca;                            % Current axes handle
gco;                            % Current object handle

% Set current
figure(fig);
axes(ax);
```

## Customization

### Labels and Title

```matlab
title('My Title');
title('My Title', 'FontSize', 14, 'FontWeight', 'bold');

xlabel('X Label');
ylabel('Y Label');
zlabel('Z Label');              % For 3D

% With interpreter
title('$$\int_0^1 x^2 dx$$', 'Interpreter', 'latex');
xlabel('Time (s)', 'Interpreter', 'none');
```

### Legend

```matlab
legend('Series 1', 'Series 2');
legend({'Series 1', 'Series 2'});
legend('Location', 'best');     % Auto-place
legend('Location', 'northeast');
legend('Location', 'northeastoutside');

% With specific plots
h1 = plot(x1, y1);
h2 = plot(x2, y2);
legend([h1, h2], {'Data 1', 'Data 2'});

legend('off');                  % Remove legend
legend('boxoff');               % Remove box
```

### Axis Control

```matlab
axis([xmin xmax ymin ymax]);    % Set limits
axis([xmin xmax ymin ymax zmin zmax]);  % 3D
xlim([xmin xmax]);
ylim([ymin ymax]);
zlim([zmin zmax]);

axis equal;                     % Equal aspect ratio
axis square;                    % Square axes
axis tight;                     % Fit to data
axis auto;                      % Automatic
axis off;                       % Hide axes
axis on;                        % Show axes

% Reverse direction
set(gca, 'YDir', 'reverse');
set(gca, 'XDir', 'reverse');
```

### Grid and Box

```matlab
grid on;
grid off;
grid minor;                     % Minor grid lines

box on;                         % Show box
box off;                        % Hide box
```

### Ticks

```matlab
xticks([0 1 2 3 4 5]);
yticks(0:0.5:3);

xticklabels({'A', 'B', 'C', 'D', 'E', 'F'});
yticklabels({'Low', 'Medium', 'High'});

xtickangle(45);                 % Rotate labels
ytickformat('%.2f');            % Format
xtickformat('usd');             % Currency
```

### Colors and Colormaps

```matlab
% Predefined colormaps
colormap(jet);
colormap(parula);               % Default
colormap(hot);
colormap(cool);
colormap(gray);
colormap(bone);
colormap(hsv);
colormap(turbo);
colormap(viridis);

% Colorbar
colorbar;
colorbar('Location', 'eastoutside');
caxis([cmin cmax]);             % Color limits
clim([cmin cmax]);              % R2022a+ syntax

% Custom colormap
cmap = [1 0 0; 0 1 0; 0 0 1];   % Red, green, blue
colormap(cmap);

% Color order for lines
colororder(colors);             % R2019b+
```

### Text and Annotations

```matlab
% Add text
text(x, y, 'Label');
text(x, y, z, 'Label');         % 3D
text(x, y, 'Label', 'FontSize', 12, 'Color', 'red');
text(x, y, 'Label', 'HorizontalAlignment', 'center');

% Annotations
annotation('arrow', [x1 x2], [y1 y2]);
annotation('textarrow', [x1 x2], [y1 y2], 'String', 'Peak');
annotation('ellipse', [x y w h]);
annotation('rectangle', [x y w h]);
annotation('line', [x1 x2], [y1 y2]);

% Text with LaTeX
text(x, y, '$$\alpha = \beta^2$$', 'Interpreter', 'latex');
```

### Lines and Shapes

```matlab
% Reference lines
xline(5);                       % Vertical line at x=5
yline(10);                      % Horizontal line at y=10
xline(5, '--r', 'Threshold');   % With label

% Shapes
rectangle('Position', [x y w h]);
rectangle('Position', [x y w h], 'Curvature', [0.2 0.2]);  % Rounded

% Patches (filled polygons)
patch(xv, yv, 'blue');
patch(xv, yv, zv, 'blue');      % 3D
```

## Exporting and Saving

### Save Figure

```matlab
saveas(gcf, 'figure.png');
saveas(gcf, 'figure.fig');      % MATLAB figure file
saveas(gcf, 'figure.pdf');
saveas(gcf, 'figure.eps');
```

### Print Command

```matlab
print('-dpng', 'figure.png');
print('-dpng', '-r300', 'figure.png');  % 300 DPI
print('-dpdf', 'figure.pdf');
print('-dsvg', 'figure.svg');
print('-deps', 'figure.eps');
print('-depsc', 'figure.eps');  % Color EPS

% Vector formats for publication
print('-dpdf', '-painters', 'figure.pdf');
print('-dsvg', '-painters', 'figure.svg');
```

### Export Graphics (R2020a+)

```matlab
exportgraphics(gcf, 'figure.png');
exportgraphics(gcf, 'figure.png', 'Resolution', 300);
exportgraphics(gcf, 'figure.pdf', 'ContentType', 'vector');
exportgraphics(gca, 'axes_only.png');  % Just the axes

% For presentations/documents
exportgraphics(gcf, 'figure.emf');    % Windows
exportgraphics(gcf, 'figure.eps');    % LaTeX
```

### Copy to Clipboard

```matlab
copygraphics(gcf);              % Copy current figure
copygraphics(gca);              % Copy current axes
copygraphics(gcf, 'ContentType', 'vector');
```

### Paper Size (for Printing)

```matlab
set(gcf, 'PaperUnits', 'inches');
set(gcf, 'PaperPosition', [0 0 6 4]);
set(gcf, 'PaperSize', [6 4]);
set(gcf, 'PaperPositionMode', 'auto');
```
