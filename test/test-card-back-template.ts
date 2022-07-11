const expect = require('chai').expect

import {DefaultTemplate} from '../src/templates/v1/default/Back';
import {createCanvas} from 'canvas';

const sinon = require("sinon");

describe('Card Back template', () => {

  interface LineBreakTestParameters {
    expectation: string,
    font?: string,
  }

  abstract class LineBreakTest<P extends LineBreakTestParameters> {

    private static readonly DEFAULT_FONT = "18pt Minion";

    public constructor(protected params: P) {}

    public execute() {

      const canvas = createCanvas(0, 0);
      const context = canvas.getContext('2d');

      const fake = sinon.replace(context, "fillText", sinon.fake(context.fillText));

      context.font = this.params.font ?? LineBreakTest.DEFAULT_FONT;
      this.print(context);

      const printed: string[] = []
      for (const invocation of fake.getCalls()) {
        printed.push(invocation.args[0]);
      }

      expect(printed.join('\n')).to.equal(this.params.expectation);

    }

    protected abstract print(context: CanvasRenderingContext2D): void;

  }

  interface WrapTextTestParameters extends LineBreakTestParameters {
    text: string,
    width?: number // pixels
  }

  /**
   * Defines an executable unit test for the wrapText(...) method in Card Back Template.
   */
  class WrapTextTest extends LineBreakTest<WrapTextTestParameters> {

    private static readonly DEFAULT_WIDTH = 340; // pixels

    protected print(context: CanvasRenderingContext2D): void {
      new DefaultTemplate().wrapText(context, this.params.text, 0, 0, this.params.width ?? WrapTextTest.DEFAULT_WIDTH, 0);
    }

  }

  before(() => {
    DefaultTemplate.registerFonts();
  })

  it('wrapText(...) writes descriptions for Legacy SKU', () => {

    const tests: WrapTextTest[] = [
      new WrapTextTest({
        text:
            "Sculpted from the finest digital Marquina marble and accented with gold.",
        expectation:
            "Sculpted from the finest digital \n" +
            "Marquina marble and accented with \n" +
            "gold. "
      }),
      new WrapTextTest({
        text:
            "The Dao-Disk gloves are the key to unlocking Cybermonk's inner journey. They provide insulation and protection from the elements. However, the most important function is the Dao-Disk, which serves as a digital prayer wheel.",
        expectation:
            "The Dao-Disk gloves are the key to \n" +
            "unlocking Cybermonk's inner \n" +
            "journey. They provide insulation \n" +
            "and protection from the elements. \n" +
            "However, the most important \n" +
            "function is the Dao-Disk, which \n" +
            "serves as a digital prayer wheel. "
      }),
      new WrapTextTest({
        text:
            "Feel the faux fur fuzz. This Fuzz Dome hat in Fuchsia colourway is one of six designs for Benny Andallo's first-ever digital collection.",
        expectation:
            "Feel the faux fur fuzz. This Fuzz \n" +
            "Dome hat in Fuchsia colourway is \n" +
            "one of six designs for Benny \n" +
            "Andallo's first-ever digital \n" +
            "collection. "
      })
    ];

    for (const test of tests) {
      test.execute()
    }

  });

  it('wrapText(...) allows a large word on the first line to exceed maximum width', () => {
    new WrapTextTest({
      width: 10, // pixels
      text:
          "supercalifragilisticexpialidocious",
      expectation:
          "supercalifragilisticexpialidocious "
    }).execute();
  });

  it('wrapText(...) allows a large word on a subsequent line to exceed maximum width', () => {
    new WrapTextTest({
      width: 280, // pixels
      text:
          "If you say it loud enough you'll always sound precocious, supercalifragilisticexpialidocious",
      expectation:
          "If you say it loud enough \n" +
          "you'll always sound \n" +
          "precocious, \n" +
          "supercalifragilisticexpialidocious "
    }).execute();
  });

})
