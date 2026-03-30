**CRITICAL: You MUST complete these steps in order. Do not skip ahead to writing code.**

If you need to fill out a PDF form, first check to see if the PDF has fillable form fields. Run this script from this file's directory:
 `python scripts/check_fillable_fields <file.pdf>`, and depending on the result go to either the "Fillable fields" or "Non-fillable fields" and follow those instructions.

# Fillable fields
If the PDF has fillable form fields:
- Run this script from this file's directory: `python scripts/extract_form_field_info.py <input.pdf> <field_info.json>`. It will create a JSON file with a list of fields in this format:
```
[
  {
    "field_id": (unique ID for the field),
    "page": (page number, 1-based),
    "rect": ([left, bottom, right, top] bounding box in PDF coordinates, y=0 is the bottom of the page),
    "type": ("text", "checkbox", "radio_group", or "choice"),
  },
  // Checkboxes have "checked_value" and "unchecked_value" properties:
  {
    "field_id": (unique ID for the field),
    "page": (page number, 1-based),
    "type": "checkbox",
    "checked_value": (Set the field to this value to check the checkbox),
    "unchecked_value": (Set the field to this value to uncheck the checkbox),
  },
  // Radio groups have a "radio_options" list with the possible choices.
  {
    "field_id": (unique ID for the field),
    "page": (page number, 1-based),
    "type": "radio_group",
    "radio_options": [
      {
        "value": (set the field to this value to select this radio option),
        "rect": (bounding box for the radio button for this option)
      },
      // Other radio options
    ]
  },
  // Multiple choice fields have a "choice_options" list with the possible choices:
  {
    "field_id": (unique ID for the field),
    "page": (page number, 1-based),
    "type": "choice",
    "choice_options": [
      {
        "value": (set the field to this value to select this option),
        "text": (display text of the option)
      },
      // Other choice options
    ],
  }
]
```
- Convert the PDF to PNGs (one image for each page) with this script (run from this file's directory):
`python scripts/convert_pdf_to_images.py <file.pdf> <output_directory>`
Then analyze the images to determine the purpose of each form field (make sure to convert the bounding box PDF coordinates to image coordinates).
- Create a `field_values.json` file in this format with the values to be entered for each field:
```
[
  {
    "field_id": "last_name", // Must match the field_id from `extract_form_field_info.py`
    "description": "The user's last name",
    "page": 1, // Must match the "page" value in field_info.json
    "value": "Simpson"
  },
  {
    "field_id": "Checkbox12",
    "description": "Checkbox to be checked if the user is 18 or over",
    "page": 1,
    "value": "/On" // If this is a checkbox, use its "checked_value" value to check it. If it's a radio button group, use one of the "value" values in "radio_options".
  },
  // more fields
]
```
- Run the `fill_fillable_fields.py` script from this file's directory to create a filled-in PDF:
`python scripts/fill_fillable_fields.py <input pdf> <field_values.json> <output pdf>`
This script will verify that the field IDs and values you provide are valid; if it prints error messages, correct the appropriate fields and try again.

# Non-fillable fields
If the PDF doesn't have fillable form fields, you'll add text annotations. First try to extract coordinates from the PDF structure (more accurate), then fall back to visual estimation if needed.

## Step 1: Try Structure Extraction First

Run this script to extract text labels, lines, and checkboxes with their exact PDF coordinates:
`python scripts/extract_form_structure.py <input.pdf> form_structure.json`

This creates a JSON file containing:
- **labels**: Every text element with exact coordinates (x0, top, x1, bottom in PDF points)
- **lines**: Horizontal lines that define row boundaries
- **checkboxes**: Small square rectangles that are checkboxes (with center coordinates)
- **row_boundaries**: Row top/bottom positions calculated from horizontal lines

**Check the results**: If `form_structure.json` has meaningful labels (text elements that correspond to form fields), use **Approach A: Structure-Based Coordinates**. If the PDF is scanned/image-based and has few or no labels, use **Approach B: Visual Estimation**.

---

## Approach A: Structure-Based Coordinates (Preferred)

Use this when `extract_form_structure.py` found text labels in the PDF.

### A.1: Analyze the Structure

Read form_structure.json and identify:

1. **Label groups**: Adjacent text elements that form a single label (e.g., "Last" + "Name")
2. **Row structure**: Labels with similar `top` values are in the same row
3. **Field columns**: Entry areas start after label ends (x0 = label.x1 + gap)
4. **Checkboxes**: Use the checkbox coordinates directly from the structure

**Coordinate system**: PDF coordinates where y=0 is at TOP of page, y increases downward.

### A.2: Check for Missing Elements

The structure extraction may not detect all form elements. Common cases:
- **Circular checkboxes**: Only square rectangles are detected as checkboxes
- **Complex graphics**: Decorative elements or non-standard form controls
- **Faded or light-colored elements**: May not be extracted

If you see form fields in the PDF images that aren't in form_structure.json, you'll need to use **visual analysis** for those specific fields (see "Hybrid Approach" below).

### A.3: Create fields.json with PDF Coordinates

For each field, calculate entry coordinates from the extracted structure:

**Text fields:**
- entry x0 = label x1 + 5 (small gap after label)
- entry x1 = next label's x0, or row boundary
- entry top = same as label top
- entry bottom = row boundary line below, or label bottom + row_height

**Checkboxes:**
- Use the checkbox rectangle coordinates directly from form_structure.json
- entry_bounding_box = [checkbox.x0, checkbox.top, checkbox.x1, checkbox.bottom]

Create fields.json using `pdf_width` and `pdf_height` (signals PDF coordinates):
```json
{
  "pages": [
    {"page_number": 1, "pdf_width": 612, "pdf_height": 792}
  ],
  "form_fields": [
    {
      "page_number": 1,
      "description": "Last name entry field",
      "field_label": "Last Name",
      "label_bounding_box": [43, 63, 87, 73],
      "entry_bounding_box": [92, 63, 260, 79],
      "entry_text": {"text": "Smith", "font_size": 10}
    },
    {
      "page_number": 1,
      "description": "US Citizen Yes checkbox",
      "field_label": "Yes",
      "label_bounding_box": [260, 200, 280, 210],
      "entry_bounding_box": [285, 197, 292, 205],
      "entry_text": {"text": "X"}
    }
  ]
}
```

**Important**: Use `pdf_width`/`pdf_height` and coordinates directly from form_structure.json.

### A.4: Validate Bounding Boxes

Before filling, check your bounding boxes for errors:
`python scripts/check_bounding_boxes.py fields.json`

This checks for intersecting bounding boxes and entry boxes that are too small for the font size. Fix any reported errors before filling.

---

## Approach B: Visual Estimation (Fallback)

Use this when the PDF is scanned/image-based and structure extraction found no usable text labels (e.g., all text shows as "(cid:X)" patterns).

### B.1: Convert PDF to Images

`python scripts/convert_pdf_to_images.py <input.pdf> <images_dir/>`

### B.2: Initial Field Identification

Examine each page image to identify form sections and get **rough estimates** of field locations:
- Form field labels and their approximate positions
- Entry areas (lines, boxes, or blank spaces for text input)
- Checkboxes and their approximate locations

For each field, note approximate pixel coordinates (they don't need to be precise yet).

### B.3: Zoom Refinement (CRITICAL for accuracy)

For each field, crop a region around the estimated position to refine coordinates precisely.

**Create a zoomed crop using ImageMagick:**
```bash
magick <page_image> -crop <width>x<height>+<x>+<y> +repage <crop_output.png>
```

Where:
- `<x>, <y>` = top-left corner of crop region (use your rough estimate minus padding)
- `<width>, <height>` = size of crop region (field area plus ~50px padding on each side)

**Example:** To refine a "Name" field estimated around (100, 150):
```bash
magick images_dir/page_1.png -crop 300x80+50+120 +repage crops/name_field.png
```

(Note: if the `magick` command isn't available, try `convert` with the same arguments).

**Examine the cropped image** to determine precise coordinates:
1. Identify the exact pixel where the entry area begins (after the label)
2. Identify where the entry area ends (before next field or edge)
3. Identify the top and bottom of the entry line/box

**Convert crop coordinates back to full image coordinates:**
- full_x = crop_x + crop_offset_x
- full_y = crop_y + crop_offset_y

Example: If the crop started at (50, 120) and the entry box starts at (52, 18) within the crop:
- entry_x0 = 52 + 50 = 102
- entry_top = 18 + 120 = 138

**Repeat for each field**, grouping nearby fields into single crops when possible.

### B.4: Create fields.json with Refined Coordinates

Create fields.json using `image_width` and `image_height` (signals image coordinates):
```json
{
  "pages": [
    {"page_number": 1, "image_width": 1700, "image_height": 2200}
  ],
  "form_fields": [
    {
      "page_number": 1,
      "description": "Last name entry field",
      "field_label": "Last Name",
      "label_bounding_box": [120, 175, 242, 198],
      "entry_bounding_box": [255, 175, 720, 218],
      "entry_text": {"text": "Smith", "font_size": 10}
    }
  ]
}
```

**Important**: Use `image_width`/`image_height` and the refined pixel coordinates from the zoom analysis.

### B.5: Validate Bounding Boxes

Before filling, check your bounding boxes for errors:
`python scripts/check_bounding_boxes.py fields.json`

This checks for intersecting bounding boxes and entry boxes that are too small for the font size. Fix any reported errors before filling.

---

## Hybrid Approach: Structure + Visual

Use this when structure extraction works for most fields but misses some elements (e.g., circular checkboxes, unusual form controls).

1. **Use Approach A** for fields that were detected in form_structure.json
2. **Convert PDF to images** for visual analysis of missing fields
3. **Use zoom refinement** (from Approach B) for the missing fields
4. **Combine coordinates**: For fields from structure extraction, use `pdf_width`/`pdf_height`. For visually-estimated fields, you must convert image coordinates to PDF coordinates:
   - pdf_x = image_x * (pdf_width / image_width)
   - pdf_y = image_y * (pdf_height / image_height)
5. **Use a single coordinate system** in fields.json - convert all to PDF coordinates with `pdf_width`/`pdf_height`

---

## Step 2: Validate Before Filling

**Always validate bounding boxes before filling:**
`python scripts/check_bounding_boxes.py fields.json`

This checks for:
- Intersecting bounding boxes (which would cause overlapping text)
- Entry boxes that are too small for the specified font size

Fix any reported errors in fields.json before proceeding.

## Step 3: Fill the Form

The fill script auto-detects the coordinate system and handles conversion:
`python scripts/fill_pdf_form_with_annotations.py <input.pdf> fields.json <output.pdf>`

## Step 4: Verify Output

Convert the filled PDF to images and verify text placement:
`python scripts/convert_pdf_to_images.py <output.pdf> <verify_images/>`

If text is mispositioned:
- **Approach A**: Check that you're using PDF coordinates from form_structure.json with `pdf_width`/`pdf_height`
- **Approach B**: Check that image dimensions match and coordinates are accurate pixels
- **Hybrid**: Ensure coordinate conversions are correct for visually-estimated fields
