const expect = require('chai').expect

import {Style, DefaultTemplate} from '../src/templates/v1/default/Back';
import {createCanvas} from 'canvas';

const sinon = require("sinon");

describe('Card Back template', () => {

  abstract class LineBreakTest {

    protected constructor(
        protected style: Style,
        protected text: string,
        protected expectation: string,
    ) {}

    public execute() {

      const canvas = createCanvas(0, 0);
      const context = canvas.getContext('2d');

      const fake = sinon.replace(context, "fillText", sinon.fake(context.fillText));

      new DefaultTemplate().print(context, this.style, this.text, 0, 0);

      const printed: string[] = []
      for (const invocation of fake.getCalls()) {
        printed.push(invocation.args[0]);
      }

      expect(printed.join('\n')).to.equal(this.expectation);

    }

  }

  before(() => {
    DefaultTemplate.registerFonts();
  })

  describe('print(...) method', () => {

    class DescriptionTest extends LineBreakTest {
      constructor(text: string, expectation: string) {
        super(DefaultTemplate.DESCRIPTION_STYLE, text, expectation);
      }
    }

    it('writes descriptions for Legacy SKU', () => {

      const tests: DescriptionTest[] = [
        new DescriptionTest(
              "Sculpted from the finest digital Marquina marble and accented with gold.",
              "Sculpted from the finest digital \n" +
              "Marquina marble and accented with \n" +
              "gold. "
        ),
        new DescriptionTest(
              "The Dao-Disk gloves are the key to unlocking Cybermonk's inner journey. They provide insulation and protection from the elements. However, the most important function is the Dao-Disk, which serves as a digital prayer wheel.",
              "The Dao-Disk gloves are the key to \n" +
              "unlocking Cybermonk's inner \n" +
              "journey. They provide insulation \n" +
              "and protection from the elements. \n" +
              "However, the most important \n" +
              "function is the Dao-Disk, which \n" +
              "serves as a digital prayer wheel. "
        ),
        new DescriptionTest(
              "Feel the faux fur fuzz. This Fuzz Dome hat in Fuchsia colourway is one of six designs for Benny Andallo's first-ever digital collection.",
              "Feel the faux fur fuzz. This Fuzz \n" +
              "Dome hat in Fuchsia colourway is \n" +
              "one of six designs for Benny \n" +
              "Andallo's first-ever digital \n" +
              "collection. "
        )
      ];

      for (const test of tests) {
        test.execute()
      }

    });

    it('allows a large word on the first line to exceed maximum width', () => {
      new DescriptionTest(
            "supercalifragilisticexpialidocious",
            "supercalifragilisticexpialidocious "
      ).execute();
    });

    it('allows a large word on a subsequent line to exceed maximum width', () => {
      new DescriptionTest(
            "If you say it loud enough you'll always sound precocious, supercalifragilisticexpialidocious",
            "If you say it loud enough you'll \n" +
          "always sound precocious, \n" +
          "supercalifragilisticexpialidocious "
      ).execute();
    });

  });

  describe('writeText(...) method', () => {

    class ValueTest extends LineBreakTest {
      constructor(text: string, expectation: string) {
        super(DefaultTemplate.VALUE_STYLE, text, expectation);
      }
    }

    it('writes names for Legacy SKU', () => {

      const tests: ValueTest[] = [
        new ValueTest(
              "Baker Crown Juicy",
              "Baker Crown \n" +
              "Juicy ",
        ),
        new ValueTest(
              "Baker Crown Leopard",
              "Baker Crown \n" +
              "Leopard ",
        ),
        new ValueTest(
              "Boiling Point | Scenic",
              "Boiling Point | \n" +
              "Scenic ",
        ),
        new ValueTest(
              "Boiling Point",
              "Boiling Point ",
        ),
        new ValueTest(
              "DAPHNE DRESS: THE ESCAPE",
              "DAPHNE DRESS: \n" +
              "THE ESCAPE ",
        ),
        new ValueTest(
              "DEEPS BACKPACK: DEEP COVER",
              "DEEPS BACKPACK: \n" +
              "DEEP COVER ",
        ),
        new ValueTest(
              "DEEPS BACKPACK: DEEP OCEAN",
              "DEEPS BACKPACK: \n" +
              "DEEP OCEAN ",
        ),
        new ValueTest(
              "DG Welcome",
              "DG Welcome ",
        ),
        new ValueTest(
              "Dao-Disk Gloves",
              "Dao-Disk Gloves ",
        ),
        new ValueTest(
              "Daphne Silver Dress",
              "Daphne Silver \n" +
              "Dress ",
        ),
        new ValueTest(
              "Fuzz Dome Fuchsia",
              "Fuzz Dome \n" +
              "Fuchsia ",
        ),
        new ValueTest(
              "Fuzz Dome Purple",
              "Fuzz Dome \n" +
              "Purple ",
        ),
        new ValueTest(
              "Geode Marble Jacket",
              "Geode Marble \n" +
              "Jacket ",
        ),
        new ValueTest(
              "Kap-Tec Helmet",
              "Kap-Tec Helmet ",
        ),
        new ValueTest(
              "Luna Geta-boots",
              "Luna Geta-boots ",
        ),
        new ValueTest(
              "OLYMPUS SNEAKER: HADES",
              "OLYMPUS \n" +
              "SNEAKER: HADES ",
        ),
        new ValueTest(
              "OLYMPUS SNEAKER: HERA",
              "OLYMPUS \n" +
              "SNEAKER: HERA ",
        ),
        new ValueTest(
              "OLYMPUS SNEAKER: KHRONOS",
              "OLYMPUS \n" +
              "SNEAKER: \n" +
              "KHRONOS ",
        ),
        new ValueTest(
              "Olympus Black Gloss",
              "Olympus Black \n" +
              "Gloss ",
        ),
        new ValueTest(
              "Olympus Black Matte",
              "Olympus Black \n" +
              "Matte ",
        ),
        new ValueTest(
              "Olympus White Matte",
              "Olympus White \n" +
              "Matte ",
        ),
        new ValueTest(
              "SCRAPS | Scenic",
              "SCRAPS | Scenic ",
        ),
        new ValueTest(
              "SCRAPS",
              "SCRAPS ",
        ),
        new ValueTest(
              "Tactiquilt Robe",
              "Tactiquilt Robe ",
        ),
        new ValueTest(
              "Timo Rusall Hoodie",
              "Timo Rusall \n" +
              "Hoodie ",
        ),
        new ValueTest(
              "What's In Your Bag | Scenic",
              "What's In Your \n" +
              "Bag | Scenic ",
        ),
        new ValueTest(
              "What's In Your Bag",
              "What's In Your \n" +
              "Bag ",
        ),
        new ValueTest(
              "Wonky Dome Moo Moo",
              "Wonky Dome Moo \n" +
              "Moo ",
        ),
        new ValueTest(
              "Wonky Dome Acid",
              "Wonky Dome Acid ",
        ),
      ];

      for (const test of tests) {
        test.execute();
      }

    });

    it('writes a single line of fewer than 15 characters', () => {
      new ValueTest(
            "foo",
            "foo "
      ).execute();
    });

    it('allows a large word on the first line to exceed maximum width', () => {
      new ValueTest(
            "LongerThanFifteen",
            "LongerThanFifteen "
      ).execute();
    });

    it('allows a large word on a subsequent line to exceed maximum width', () => {
      new ValueTest(
            "next word is LongerThanFifteen",
            "next word is \n" +
            "LongerThanFifteen "
      ).execute();
    });

  });

})
