#!/bin/bash

set -e

# Check for ImageMagick
if ! command -v magick >/dev/null 2>&1; then
  echo "Error: ImageMagick is not installed."
  echo "Install with: brew install imagemagick"
  exit 1
fi

# Process PNG and WEBP files
find . -type f \( -iname "*.png" -o -iname "*.webp" \) | while read -r file; do
  ext="${file##*.}"
  ext_lower=$(echo "$ext" | tr '[:upper:]' '[:lower:]')

  if [[ "$ext_lower" == "png" ]]; then
    output="${file%.*}.webp"

    echo "Converting PNG → WEBP and resizing: $file"

    magick "$file" \
      -resize 45x45\! \
      -strip \
      "$output"

  elif [[ "$ext_lower" == "webp" ]]; then
    echo "Resizing existing WEBP: $file"

    # Resize in-place safely using a temp file
    tmp="${file}.tmp.webp"

    magick "$file" \
      -resize 45x45\! \
      -strip \
      "$tmp"

    mv "$tmp" "$file"
  fi
done

echo "All images processed."