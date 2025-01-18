# MMM-Shairportsync-color

**MMM-Shairportsync-color** is a MagicMirror² module that dynamically changes the text color of your MagicMirror² interface based on the dominant color palette extracted from an AirPlay-compatible music stream's album art. The module was inspired by [MMM-OnSpotify](https://github.com/Fabrizz/MMM-OnSpotify) and aims to provide a similar functionality, but for Shairport-sync.

## Features

- Extracts dominant color palettes from album art provided by Shairport-sync.
- Dynamically updates MagicMirror² text styles based on the extracted color palette.
- Adjustable brightness and color preferences via a `config.js`.
- Supports both manual and automatic color theme settings.

## Requirements

1. MagicMirror² installed and running.
2. [Shairport-sync](https://github.com/mikebrady/shairport-sync.git) installed and configured to provide metadata and this module [MMM-Shairportsync](https://github.com/sdmydbr9/MMM-ShairportMetadata.git)
3. Python 3 with the `Pillow` and `colorthief` libraries installed (for image processing).

## Installation

1. Clone the repository into your MagicMirror modules directory:
   ```bash
   cd ~/MagicMirror/modules
   git clone https://github.com/sdmydbr9/MMM-Shairportsync-color.git
   ```

2. Navigate to the module's directory:
   ```bash
   cd MMM-Shairportsync-color
   ```

3. Install the required npm dependencies:
   ```bash
   npm install
   ```

4. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Configuration

Add the module to the `config.js` file of your MagicMirror² installation. Below is an example configuration:

```javascript
{
  module: 'MMM-Shairportsync-color',
  config: {
    brightness: 1.5, // Adjust text brightness (e.g., 1.0 for default, 1.5 for brighter)
    paletteIndex: 0, // Use palette index (e.g., 0 for the most dominant color)
    namedColor: "primary", // Alternatively, use named colors like "primary" or "accent"
  }
}
```

### Configuration Options

| Option         | Type    | Description                                                                 |
|----------------|---------|-----------------------------------------------------------------------------|
| `brightness`   | Float   | Adjusts the brightness of the text. Default is `1.0`.                       |
| `paletteIndex` | Integer | Specifies the index of the color in the palette to use (0 = most dominant). |
| `namedColor`   | String  | A human-readable color label like "primary", "secondary", etc.             |

## How It Works

1. The module listens for metadata broadcasted by Shairport-sync, including album art as a base64-encoded string.
2. It processes the image using Python to extract a color palette.
3. The dominant or selected color is applied to the text styles of your MagicMirror² interface.

## Troubleshooting

1. **No color updates:** Ensure the `shairport-sync-metadata` script is correctly configured and broadcasting metadata.
2. **Python errors:** Check that `Pillow` and `colorthief` are installed using `pip`.
3. **General issues:** Check the MagicMirror² terminal log for error messages.

## Acknowledgments

This module was inspired by [MMM-OnSpotify](https://github.com/Fabrizz/MMM-OnSpotify). Many thanks to its developer for the concept and approach.

## License

This project is licensed under the MIT License 

