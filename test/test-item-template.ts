const expect = require('chai').expect
import {ItemTemplate} from '../src/templates/v1/default/Item'


describe('Text template parser', () => {

  describe('parse method', () => {

    it('supports plain strings', () => {
      const result = new ItemTemplate().parseTemplateString('Nothing to do', {})
      expect(result).to.equal('Nothing to do')
    });

    it('replaces tokens', () => {

      const data = {
        "name": "John Smith",
        "age": 34
      }

      const result = new ItemTemplate().parseTemplateString('My name is ${name} and I am ${age}.', data)
      expect(result).to.equal('My name is John Smith and I am 34.')
    });




  });


})
