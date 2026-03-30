# LaTeX Beamer Guide for Scientific Presentations

## Overview

Beamer is a LaTeX document class for creating presentations with professional, consistent formatting. It's particularly well-suited for scientific presentations containing equations, code, algorithms, and citations. This guide covers Beamer basics, themes, customization, and advanced features for effective scientific talks.

## Why Use Beamer?

### Advantages

**Professional Quality**:
- Consistent, polished appearance
- Beautiful typography (especially for math)
- Publication-quality output
- Professional themes and templates

**Scientific Content**:
- Native equation support (LaTeX math)
- Code listings with syntax highlighting
- Algorithm environments
- Bibliography integration
- Cross-referencing

**Reproducibility**:
- Plain text source (version control friendly)
- Programmatic figure generation
- Consistent styling across presentations
- Easy to maintain and update

**Efficiency**:
- Reuse content across presentations
- Template once, use forever
- Automated elements (page numbers, navigation)
- No manual formatting

### Disadvantages

**Learning Curve**:
- Requires LaTeX knowledge
- Compilation time
- Debugging can be challenging
- Less WYSIWYG than PowerPoint

**Flexibility**:
- Complex custom layouts require effort
- Image editing requires external tools
- Some design elements easier in PowerPoint
- Animations more limited

**Collaboration**:
- Not ideal for non-LaTeX users
- Version conflicts possible
- Requires LaTeX installation

## Basic Beamer Document Structure

### Minimal Example

```latex
\documentclass{beamer}

% Theme
\usetheme{Madrid}
\usecolortheme{beaver}

% Title information
\title{Your Presentation Title}
\subtitle{Optional Subtitle}
\author{Your Name}
\institute{Your Institution}
\date{\today}

\begin{document}

% Title slide
\begin{frame}
  \titlepage
\end{frame}

% Content slide
\begin{frame}{Slide Title}
  Content goes here
\end{frame}

\end{document}
```

### Essential Packages

```latex
\documentclass{beamer}

% Encoding and fonts
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}

% Graphics
\usepackage{graphicx}
\graphicspath{{./figures/}}

% Math
\usepackage{amsmath, amssymb, amsthm}

% Tables
\usepackage{booktabs}
\usepackage{multirow}

% Colors
\usepackage{xcolor}

% Algorithms
\usepackage{algorithm}
\usepackage{algorithmic}

% Code listings
\usepackage{listings}

% Citations
\usepackage[style=authoryear,backend=biber]{biblatex}
\addbibresource{references.bib}
```

### Frame Basics

```latex
% Basic frame
\begin{frame}{Title}
  Content
\end{frame}

% Frame with subtitle
\begin{frame}{Title}{Subtitle}
  Content
\end{frame}

% Frame without title
\begin{frame}
  Content
\end{frame}

% Fragile frame (for verbatim/code)
\begin{frame}[fragile]{Code Example}
  \begin{verbatim}
  def hello():
      print("Hello")
  \end{verbatim}
\end{frame}

% Plain frame (no header/footer)
\begin{frame}[plain]
  Full slide content
\end{frame}
```

## Themes and Appearance

### Presentation Themes

Beamer includes many built-in themes controlling overall layout:

**Classic Themes**:
```latex
\usetheme{Berlin}      % Sections in header
\usetheme{Copenhagen}  % Minimal, clean
\usetheme{Madrid}      % Professional, rounded
\usetheme{Boadilla}    % Simple footer
\usetheme{AnnArbor}    % Vertical navigation
```

**Modern Themes**:
```latex
\usetheme{CambridgeUS}  % Blue theme
\usetheme{Singapore}    % Minimalist
\usetheme{Rochester}    % Very minimal
\usetheme{Antibes}      % Tree navigation
```

**Popular for Science**:
```latex
% Clean and minimal
\usetheme{default}
\usetheme{Copenhagen}

% Professional with navigation
\usetheme{Madrid}
\usetheme{Berlin}

% Traditional academic
\usetheme{Pittsburgh}
\usetheme{Boadilla}
```

### Color Themes

```latex
% Blue themes
\usecolortheme{default}      % Blue
\usecolortheme{dolphin}      % Cyan-blue
\usecolortheme{seagull}      % Grayscale

% Warm themes
\usecolortheme{beaver}       % Red/brown
\usecolortheme{rose}         % Pink/red

% Nature themes
\usecolortheme{orchid}       % Purple
\usecolortheme{crane}        % Orange/yellow

% Professional
\usecolortheme{albatross}    % Gray/blue
```

### Font Themes

```latex
\usefonttheme{default}              % Standard
\usefonttheme{serif}                % Serif fonts
\usefonttheme{structurebold}        % Bold structure
\usefonttheme{structureitalicserif} % Italic serif
\usefonttheme{professionalfonts}    % Professional fonts
```

### Custom Colors

```latex
% Define custom colors
\definecolor{myblue}{RGB}{0,115,178}
\definecolor{myred}{RGB}{214,40,40}

% Apply to theme elements
\setbeamercolor{structure}{fg=myblue}
\setbeamercolor{title}{fg=myred}
\setbeamercolor{frametitle}{fg=myblue,bg=white}
\setbeamercolor{block title}{fg=white,bg=myblue}
```

### Minimal Custom Theme

```latex
% Remove navigation symbols
\setbeamertemplate{navigation symbols}{}

% Page numbers
\setbeamertemplate{footline}[frame number]

% Simple itemize
\setbeamertemplate{itemize items}[circle]

% Clean blocks
\setbeamertemplate{blocks}[rounded][shadow=false]

% Colors
\setbeamercolor{structure}{fg=blue!70!black}
\setbeamercolor{title}{fg=black}
\setbeamercolor{frametitle}{fg=blue!70!black}
```

## Content Elements

### Lists

**Itemize**:
```latex
\begin{frame}{Bullet Points}
  \begin{itemize}
    \item First point
    \item Second point
      \begin{itemize}
        \item Nested point
      \end{itemize}
    \item Third point
  \end{itemize}
\end{frame}
```

**Enumerate**:
```latex
\begin{frame}{Numbered List}
  \begin{enumerate}
    \item First item
    \item Second item
    \item Third item
  \end{enumerate}
\end{frame}
```

**Description**:
```latex
\begin{frame}{Definitions}
  \begin{description}
    \item[Term 1] Definition of term 1
    \item[Term 2] Definition of term 2
  \end{description}
\end{frame}
```

### Columns

```latex
\begin{frame}{Two Column Layout}
  \begin{columns}
    
    % Left column
    \begin{column}{0.5\textwidth}
      \begin{itemize}
        \item Point 1
        \item Point 2
      \end{itemize}
    \end{column}
    
    % Right column
    \begin{column}{0.5\textwidth}
      \includegraphics[width=\textwidth]{figure.png}
    \end{column}
    
  \end{columns}
\end{frame}
```

**Three Column Layout**:
```latex
\begin{columns}[T] % Align at top
  \begin{column}{0.32\textwidth}
    Content A
  \end{column}
  \begin{column}{0.32\textwidth}
    Content B
  \end{column}
  \begin{column}{0.32\textwidth}
    Content C
  \end{column}
\end{columns}
```

### Figures

```latex
\begin{frame}{Figure Example}
  \begin{figure}
    \centering
    \includegraphics[width=0.8\textwidth]{figure.pdf}
    \caption{Figure caption text}
  \end{figure}
\end{frame}
```

**Side-by-Side Figures**:
```latex
\begin{frame}{Comparison}
  \begin{columns}
    \begin{column}{0.5\textwidth}
      \includegraphics[width=\textwidth]{fig1.pdf}
      \caption{Condition A}
    \end{column}
    \begin{column}{0.5\textwidth}
      \includegraphics[width=\textwidth]{fig2.pdf}
      \caption{Condition B}
    \end{column}
  \end{columns}
\end{frame}
```

**Subfigures**:
```latex
\usepackage{subcaption}

\begin{frame}{Multiple Panels}
  \begin{figure}
    \centering
    \begin{subfigure}{0.45\textwidth}
      \includegraphics[width=\textwidth]{fig1.pdf}
      \caption{Panel A}
    \end{subfigure}
    \hfill
    \begin{subfigure}{0.45\textwidth}
      \includegraphics[width=\textwidth]{fig2.pdf}
      \caption{Panel B}
    \end{subfigure}
    \caption{Overall figure caption}
  \end{figure}
\end{frame}
```

### Tables

```latex
\begin{frame}{Table Example}
  \begin{table}
    \centering
    \begin{tabular}{lcc}
      \toprule
      Method & Accuracy & Time \\
      \midrule
      Method A & 0.85 & 10s \\
      Method B & 0.92 & 25s \\
      Method C & 0.88 & 15s \\
      \bottomrule
    \end{tabular}
    \caption{Performance comparison}
  \end{table}
\end{frame}
```

### Blocks

**Standard Blocks**:
```latex
\begin{frame}{Block Examples}
  
  % Standard block
  \begin{block}{Block Title}
    Block content goes here
  \end{block}
  
  % Alert block (red)
  \begin{alertblock}{Important}
    Warning or important information
  \end{alertblock}
  
  % Example block (green)
  \begin{exampleblock}{Example}
    Example content
  \end{exampleblock}
  
\end{frame}
```

**Theorem Environments**:
```latex
\begin{frame}{Mathematical Results}
  
  \begin{theorem}
    Statement of theorem
  \end{theorem}
  
  \begin{proof}
    Proof goes here
  \end{proof}
  
  \begin{definition}
    Definition text
  \end{definition}
  
  \begin{lemma}
    Lemma statement
  \end{lemma}
  
\end{frame}
```

## Overlays and Animations

### Progressive Disclosure with \pause

```latex
\begin{frame}{Revealing Content}
  First point appears immediately
  
  \pause
  
  Second point appears on click
  
  \pause
  
  Third point appears on another click
\end{frame}
```

### Overlay Specifications

**Itemize with Overlays**:
```latex
\begin{frame}{Sequential Bullets}
  \begin{itemize}
    \item<1-> Appears on slide 1 and stays
    \item<2-> Appears on slide 2 and stays
    \item<3-> Appears on slide 3 and stays
  \end{itemize}
\end{frame}
```

**Alternative Syntax**:
```latex
\begin{frame}{Sequential Bullets}
  \begin{itemize}[<+->]  % Automatically sequential
    \item First point
    \item Second point
    \item Third point
  \end{itemize}
\end{frame}
```

### Highlighting with Overlays

**Alert on Specific Slides**:
```latex
\begin{frame}{Highlighting}
  \begin{itemize}
    \item Normal text
    \item<2-| alert@2> Text highlighted on slide 2
    \item Normal text
  \end{itemize}
\end{frame}
```

**Temporary Appearance**:
```latex
\begin{frame}{Appearing and Disappearing}
  Appears on all slides
  
  \only<2>{Only visible on slide 2}
  
  \uncover<3->{Appears on slide 3 and stays}
  
  \visible<4->{Also appears on slide 4, but reserves space}
\end{frame}
```

### Building Complex Figures

```latex
\begin{frame}{Building a Figure}
  \begin{tikzpicture}
    % Base elements (always visible)
    \draw (0,0) rectangle (4,3);
    
    % Add on slide 2+
    \draw<2-> (1,1) circle (0.5);
    
    % Add on slide 3+
    \draw<3->[->, thick] (2,1.5) -- (3,2);
    
    % Highlight on slide 4
    \node<4>[red,thick] at (2,1.5) {Result};
  \end{tikzpicture}
\end{frame}
```

## Mathematical Content

### Equations

**Inline Math**:
```latex
\begin{frame}{Inline Math}
  The equation $E = mc^2$ is famous.
  
  We can also write $\alpha + \beta = \gamma$.
\end{frame}
```

**Display Math**:
```latex
\begin{frame}{Display Equations}
  Single equation:
  \begin{equation}
    f(x) = \int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
  \end{equation}
  
  Multiple equations:
  \begin{align}
    E &= mc^2 \\
    F &= ma \\
    V &= IR
  \end{align}
\end{frame}
```

**Equation Arrays**:
```latex
\begin{frame}{Equation System}
  \begin{equation}
    \begin{cases}
      \dot{x} = f(x,y) \\
      \dot{y} = g(x,y)
    \end{cases}
  \end{equation}
\end{frame}
```

### Matrices

```latex
\begin{frame}{Matrix Example}
  \begin{equation}
    A = \begin{bmatrix}
      a_{11} & a_{12} & a_{13} \\
      a_{21} & a_{22} & a_{23} \\
      a_{31} & a_{32} & a_{33}
    \end{bmatrix}
  \end{equation}
\end{frame}
```

## Code and Algorithms

### Code Listings

```latex
\begin{frame}[fragile]{Python Code}
  \begin{lstlisting}[language=Python]
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
  \end{lstlisting}
\end{frame}
```

**Custom Code Styling**:
```latex
\lstset{
  language=Python,
  basicstyle=\ttfamily\small,
  keywordstyle=\color{blue},
  commentstyle=\color{green!60!black},
  stringstyle=\color{orange},
  numbers=left,
  numberstyle=\tiny,
  frame=single,
  breaklines=true
}

\begin{frame}[fragile]{Styled Code}
  \begin{lstlisting}
  # This is a comment
  def hello(name):
      """Greet someone"""
      print(f"Hello, {name}")
  \end{lstlisting}
\end{frame}
```

### Algorithms

```latex
\begin{frame}{Algorithm Example}
  \begin{algorithm}[H]
    \caption{Quicksort}
    \begin{algorithmic}[1]
      \REQUIRE Array $A$, indices $low$, $high$
      \ENSURE Sorted array
      \IF{$low < high$}
        \STATE $pivot \gets partition(A, low, high)$
        \STATE $quicksort(A, low, pivot-1)$
        \STATE $quicksort(A, pivot+1, high)$
      \ENDIF
    \end{algorithmic}
  \end{algorithm}
\end{frame}
```

## Citations and Bibliography

### Inline Citations

```latex
\begin{frame}{Background}
  Previous work \cite{smith2020} showed that...
  
  Multiple studies \cite{jones2019,brown2021} have found...
  
  According to \textcite{davis2022}, the method works by...
\end{frame}
```

### Bibliography Slide

```latex
% At end of presentation
\begin{frame}[allowframebreaks]{References}
  \printbibliography
\end{frame}
```

### Custom Bibliography Style

```latex
% In preamble
\usepackage[style=authoryear,maxbibnames=2,maxcitenames=2]{biblatex}
\addbibresource{references.bib}

% Smaller font for references
\renewcommand*{\bibfont}{\scriptsize}
```

## Advanced Features

### Section Organization

```latex
\section{Introduction}
\begin{frame}{Introduction}
  Content
\end{frame}

\section{Methods}
\begin{frame}{Methods}
  Content
\end{frame}

% Automatic outline
\begin{frame}{Outline}
  \tableofcontents
\end{frame}

% Outline at each section
\AtBeginSection{
  \begin{frame}{Outline}
    \tableofcontents[currentsection]
  \end{frame}
}
```

### Backup Slides

```latex
% Main presentation ends
\begin{frame}{Thank You}
  Questions?
\end{frame}

% Backup slides (not counted in numbering)
\appendix

\begin{frame}{Extra Data}
  Additional analysis for questions
\end{frame}

\begin{frame}{Detailed Methods}
  More methodological details
\end{frame}
```

### Hyperlinks

```latex
% Define labels
\begin{frame}{Main Result}
  \label{mainresult}
  This is the main finding.
\end{frame}

% Link to labeled frame
\begin{frame}{Reference}
  As shown in the \hyperlink{mainresult}{main result}...
\end{frame}

% External links
\begin{frame}{Resources}
  Visit \url{https://example.com} for more information.
  
  \href{https://github.com/user/repo}{GitHub Repository}
\end{frame}
```

### QR Codes

```latex
\usepackage{qrcode}

\begin{frame}{Scan for Paper}
  \begin{center}
    \qrcode[height=3cm]{https://doi.org/10.1234/paper}
    
    \vspace{0.5cm}
    Scan for full paper
  \end{center}
\end{frame}
```

### Multimedia

```latex
\usepackage{multimedia}

\begin{frame}{Video}
  \movie[width=8cm,height=6cm]{Click to play}{video.mp4}
\end{frame}
```

**Note**: Multimedia support varies by PDF viewer.

## TikZ Graphics

### Basic Shapes

```latex
\usepackage{tikz}

\begin{frame}{TikZ Example}
  \begin{tikzpicture}
    % Rectangle
    \draw (0,0) rectangle (2,1);
    
    % Circle
    \draw (3,0.5) circle (0.5);
    
    % Line with arrow
    \draw[->, thick] (0,0) -- (3,2);
    
    % Node with text
    \node at (1.5,2) {Label};
  \end{tikzpicture}
\end{frame}
```

### Flowcharts

```latex
\usetikzlibrary{shapes,arrows,positioning}

\begin{frame}{Workflow}
  \begin{tikzpicture}[node distance=2cm]
    \node[rectangle,draw] (start) {Start};
    \node[rectangle,draw,right=of start] (process) {Process};
    \node[rectangle,draw,right=of process] (end) {End};
    
    \draw[->,thick] (start) -- (process);
    \draw[->,thick] (process) -- (end);
  \end{tikzpicture}
\end{frame}
```

### Plots

```latex
\usepackage{pgfplots}
\pgfplotsset{compat=1.18}

\begin{frame}{Data Plot}
  \begin{tikzpicture}
    \begin{axis}[
      xlabel={$x$},
      ylabel={$y$},
      width=8cm,
      height=6cm
    ]
    \addplot[blue,thick] coordinates {
      (0,0) (1,1) (2,4) (3,9)
    };
    \addplot[red,dashed] {x};
    \end{axis}
  \end{tikzpicture}
\end{frame}
```

## Compilation

### Basic Compilation

```bash
# Standard compilation
pdflatex presentation.tex

# With bibliography
pdflatex presentation.tex
biber presentation
pdflatex presentation.tex
pdflatex presentation.tex
```

### Modern Compilation (Recommended)

```bash
# Using latexmk (automated)
latexmk -pdf presentation.tex

# With continuous preview
latexmk -pdf -pvc presentation.tex
```

### Compilation Options

```bash
# Faster compilation (draft mode)
pdflatex -draftmode presentation.tex

# Specific engine
lualatex presentation.tex    # Better Unicode support
xelatex presentation.tex     # System fonts

# Output directory
pdflatex -output-directory=build presentation.tex
```

## Handouts and Notes

### Creating Handouts

```latex
% In preamble
\documentclass[handout]{beamer}

% This removes overlays and creates one frame per slide
```

### Speaker Notes

```latex
\usepackage{pgfpages}
\setbeameroption{show notes on second screen=right}

\begin{frame}{Slide Title}
  Slide content visible to audience
  
  \note{
    These notes are visible only to speaker:
    - Remember to emphasize X
    - Mention collaboration with Y
    - Expect question about Z
  }
\end{frame}
```

### Handout with Notes

```latex
\documentclass[handout]{beamer}
\usepackage{pgfpages}
\pgfpagesuselayout{2 on 1}[a4paper,border shrink=5mm]
```

## Best Practices

### Do's

- ✅ Use consistent theme throughout
- ✅ Keep equations simple and large
- ✅ Use progressive disclosure (\pause, overlays)
- ✅ Include frame numbers
- ✅ Use vector graphics (PDF) for figures
- ✅ Test compilation early and often
- ✅ Use meaningful section names
- ✅ Keep backup slides in appendix

### Don'ts

- ❌ Don't use too many different fonts or colors
- ❌ Don't fill slides with dense text
- ❌ Don't use tiny font sizes
- ❌ Don't include complex animations (limited support)
- ❌ Don't forget fragile frames for code
- ❌ Don't mix themes inconsistently
- ❌ Don't ignore compilation warnings

## Troubleshooting

### Common Issues

**Missing Fragile**:
```
Error: Verbatim environment in frame
Solution: Add [fragile] option to frame
```

**Package Conflicts**:
```
Error: Option clash for package X
Solution: Load package in preamble only once
```

**Image Not Found**:
```
Error: File `figure.pdf' not found
Solution: Check path, use \graphicspath, ensure file exists
```

**Overlay Issues**:
```
Problem: Overlays not working as expected
Solution: Check syntax <n-> vs <n-m>, test incremental builds
```

### Debugging Tips

```latex
% Show frame labels
\usepackage[notref,notcite]{showkeys}

% Draft mode (faster, shows boxes)
\documentclass[draft]{beamer}

% Verbose error messages
\errorcontextlines=999
```

## Templates and Examples

### Minimal Working Example

See `assets/beamer_template_conference.tex` for a complete, customizable template for conference talks.

### Resources

- Beamer User Guide: `texdoc beamer`
- Theme Gallery: https://deic.uab.cat/~iblanes/beamer_gallery/
- TikZ Examples: https://texample.net/tikz/

## Summary

Beamer excels at:
- Mathematical content
- Consistent professional formatting
- Reproducible presentations
- Version control
- Citations and cross-references

Choose Beamer when:
- Presentation contains significant math/equations
- You value version control and plain text
- Consistent styling is priority
- You're comfortable with LaTeX

Consider PowerPoint when:
- Extensive custom graphics needed
- Collaborating with non-LaTeX users
- Complex animations required
- Rapid prototyping needed
