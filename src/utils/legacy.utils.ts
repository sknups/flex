import { CanvasRenderingContext2D, createCanvas } from 'canvas';
import { LabelDTO } from '../entities/services/item.service';
import { ImagesConfigs } from '../images/images.configs';
import { BrandTemplate } from '../templates/BrandTemplate';
import { MediaDTO } from '../entities/services/item.service';

const BASE_STYLE = {
  align: 'left',
  color: ImagesConfigs.TEXT_COLOR,
  weight: 'Regular',
}

const PRIMARY_BASE_STYLE = {
  ...BASE_STYLE,
  size: '35pt',
  x: 100,
}

function _primaryLabel(text: string): LabelDTO {
  return {
    ...PRIMARY_BASE_STYLE,
    font: 'Jost',
    text,
    y: 1040,
  };
}

function _primaryEnumerationLabel(text: string): LabelDTO {
  return {
    ...PRIMARY_BASE_STYLE,
    font: 'Share Tech Mono',
    text,
    y: 1100,
  };
}

function _secondaryLabel(text: string, y: number): LabelDTO {
  return {
    ...BASE_STYLE,
    font: 'Jost',
    size: '23.5pt',
    text,
    x: 130,
    y,
  };
}

function _secondaryValueLabel(text: string, y: number): LabelDTO {
  return {
    ...BASE_STYLE,
    font: 'Share Tech Mono',
    size: '25pt',
    text,
    x: 470,
    y,
  };
}

function _secondaryDescriptionLabel(text: string, y: number): LabelDTO {
  return {
    ...BASE_STYLE,
    font: 'Crimson Text',
    size: '18pt',
    text,
    x: 470,
    y,
  };
}

function _enumeration(rarity: number): string {
  if (rarity > 0) {
    return rarity === 1 ? '${issue}' : '${issue}/${maximum}';
  } else {
    return '';
  }
}

function _dummyContext(): CanvasRenderingContext2D {
  BrandTemplate.registerFonts();
  const canvas = createCanvas(1, 1); // Create 1x1 canvas, it's only used to calculate pixel size of text
  const context = canvas.getContext('2d');

  context.patternQuality = 'good';
  context.quality = 'good';

  return context;
}

export function wrap(context: CanvasRenderingContext2D, label: LabelDTO, maximumWidth: number, lineHeight: number): LabelDTO[] {

  context.textAlign = label.align as CanvasTextAlign;
  context.font = `${label.size} "${label.font}" ${label.weight}`;
  context.fillStyle = label.color;

  // BEWARE
  // This method prints a trailing whitespace character on each line.
  // This is visually benign, but it means that width calculations are incorrect.
  // There is almost no incentive to fix this, as word wrap calculations only affect Legacy SKU.

  let buffer = '';
  let first = true;

  let lineNumber = 0;

  const result: LabelDTO[] = [];

  for (const word of label.text.split(' ')) {

    const proposed = buffer + word + ' ';
    const width = context.measureText(proposed).width; // pixels

    if (width > maximumWidth && !first) {
      // buffer would overflow
      // print buffer contents
      result.push({
        ...label,
        text: buffer,
        y: label.y + (lineNumber * lineHeight),
      });
      // carriage return
      lineNumber += 1;
      buffer = word + ' ';
    } else {
      // buffer would not overflow
      // (or it's the very first word)
      buffer = proposed;
    }

    first = false;

  }

  result.push({
    ...label,
    text: buffer,
    y: label.y + (lineNumber * lineHeight),
  })
  return result;
}

/**
 * Can be used to populate the elements of the media block required by flex.
 *
 * This is used for items manufactured from a v1 SKU where media block is absent.
 * 
 * It serves two purposes:
 *   - Can be used directly in flex to compute a media block for v1 items, allowing all other logic to follow the v2+ code path
 *   - Can later be used by some external script to generate the labels when converting a SKU from v1 to v3.
 *
 * @param name the SKU name
 * @param description the SKU description
 * @param rarity the SKU rarity
 * @returns the media object for the item
 */
export function legacyItemMedia(name: string, description: string, rarity: number | null): MediaDTO {
  return {
    primary: { labels: legacyItemLabelsPrimary(name, rarity) },
    secondary: [{ labels: legacyItemLabelsSecondary(name, description, rarity) }],
  };
}

/**
 * Constructs the required primary labels for a legacy SKU.
 * 
 * This allows a 'card' or 'media' property to be computed for a legacy v1 SKU.
 *
 * @param name the SKU name
 * @param rarity the SKU rarity
 * @returns the labels object, usually provided item.media.secondary[0]
 */
export function legacyItemLabelsPrimary(name: string, rarity: number | null): LabelDTO[] {

  const labels: LabelDTO[] = [];

  labels.push(_primaryLabel(name));
  if (rarity && rarity > 0) {
    labels.push(_primaryEnumerationLabel(_enumeration(rarity)));
  }

  return labels;

}

/**
 * Constructs the required secondary labels for a legacy SKU.
 * Legacy SKU always have exactly 1 secondary media.
 *
 * This allows a 'media' property to be computed for a legacy v1 SKU.
 *
 * @param name the SKU name
 * @param description the SKU description
 * @param rarity the SKU rarity
 * @returns the labels object, usually provided item.media.secondary[0]
 */
export function legacyItemLabelsSecondary(name: string, description: string, rarity: number | null): LabelDTO[] {

  const labels: LabelDTO[] = [];

  const context = _dummyContext();

  let y = 200; // Draw first row 200 pixels down

  // SKU name (upper case)
  labels.push(_secondaryLabel('ITEM:', y));
  labels.push(...wrap(context, _secondaryValueLabel(name.toLocaleUpperCase(), y), 288, 34));
  y = labels[labels.length - 1].y;

  // enumeration
  if (rarity && rarity > 0) {
    y += 70;
    labels.push(_secondaryLabel('ITEM NUMBER:', y));
    labels.push(_secondaryValueLabel(_enumeration(rarity), y));
    y = labels[labels.length - 1].y;
  }

  // ownership token
  y += 70;
  labels.push(_secondaryLabel('OWNERSHIP TOKEN:', y));
  labels.push(_secondaryValueLabel('${token}', y));
  y = labels[labels.length - 1].y;

  // print description
  y += 70;
  labels.push(_secondaryLabel('DESCRIPTION:', y));
  labels.push(...wrap(context, _secondaryDescriptionLabel(description, y), 340, 35));

  return labels;

}
