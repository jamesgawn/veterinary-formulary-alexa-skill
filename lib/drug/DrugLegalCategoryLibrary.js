'use strict';
const DrugLegalCategory = require('./DrugLegalCategory');
const LogHelper = require('../LogHelper');

class DrugLegalCategoryLibrary {
	constructor(logger, data) {
		this.log = logger;
		this.log.object = 'DrugLegalCategoryLibrary';
		this.map = {};
		for (let i = 0, len = data.length; i < len; i++) {
			this.map[data[i].code] = data[i];
		}
	}

	findByCode(code) {
		this.log.info('findByCode', 'Finding drug legal category by code: ' + code);
		let drug = this.map[code];

		if (typeof drug === "undefined") {
			this.log.error('findByCode', 'Failed to retrieve drug legal category by code: ' + code);
			throw new Error('Failed to retrieve drug legal category by code: ' + code)
		}

		return drug;
	}

	static build(logger, data) {
		let drugLegalCategories = [];
		for (let  i = 0, len = data.length; i < len; i++) {
			drugLegalCategories.push(new DrugLegalCategory(new LogHelper(logger), data[i].code, data[i].name, data[i].authorisedDispensers));
		}
		return new DrugLegalCategoryLibrary(new LogHelper(logger), drugLegalCategories);
	}
}

module.exports = DrugLegalCategoryLibrary;