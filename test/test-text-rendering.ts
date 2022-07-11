const expect = require('chai').expect

import {BrandTemplate} from '../src/templates/BrandTemplate';
import {Canvas, createCanvas} from 'canvas';

const sinon = require("sinon");

/**
 * Permit abstract BrandTemplate to be instantiated.
 */
class TestTemplate extends BrandTemplate<void> {
  renderTemplate(dto: void, purpose: string): Promise<Canvas> {
    throw new Error('Not implemented!');
  }
}

describe('BrandTemplate.wrapText', () => {

  before(() => {
    BrandTemplate.registerFonts();
  })

  interface WrapTest {
    font: string,
    width: number,
    text: string,
    expectation: string
  }

  function execute(test: WrapTest) {

    const canvas = createCanvas(0, 0);
    const context = canvas.getContext('2d');

    const fake = sinon.replace(context, "fillText", sinon.fake(context.fillText));

    context.font = test.font;
    new TestTemplate().wrapText(context, test.text, 0, 0, test.width, 0);

    const printed: string[] = []
    for (const invocation of fake.getCalls()) {
      printed.push(invocation.args[0]);
    }

    expect(printed.join('\n')).to.equal(test.expectation);

  }

  it('writes descriptions for Legacy SKU', () => {

    const tests: WrapTest[] = [
      {
        font: "18pt Minion",
        width: 340,
        text:
            "Sculpted from the finest digital Marquina marble and accented with gold.",
        expectation:
            "Sculpted from the finest digital \n" +
            "Marquina marble and accented with \n" +
            "gold. "
      }, {
        font: "18pt Minion",
        width: 340,
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
      }, {
        font: "18pt Minion",
        width: 340,
        text:
            "Feel the faux fur fuzz. This Fuzz Dome hat in Fuchsia colourway is one of six designs for Benny Andallo's first-ever digital collection.",
        expectation:
            "Feel the faux fur fuzz. This Fuzz \n" +
            "Dome hat in Fuchsia colourway is \n" +
            "one of six designs for Benny \n" +
            "Andallo's first-ever digital \n" +
            "collection. "
      }
    ];

    for (const test of tests) {
      execute(test);
    }

  });

  it('allows a large word on the first line to exceed maximum width', () => {
    execute({
      font: "18pt Minion",
      width: 10,
      text:
          "supercalifragilisticexpialidocious",
      expectation:
          "supercalifragilisticexpialidocious "
    });
  });

  it('allows a large word on a subsequent line to exceed maximum width', () => {
    execute({
      font: "18pt Minion",
      width: 280,
      text:
          "If you say it loud enough you'll always sound precocious, supercalifragilisticexpialidocious",
      expectation:
          "If you say it loud enough \n" +
          "you'll always sound \n" +
          "precocious, \n" +
          "supercalifragilisticexpialidocious "
    });
  })

})
