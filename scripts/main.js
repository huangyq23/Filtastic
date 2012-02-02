var filter = new Filtastic.FilterEditor({
	container: 'search_option_container',
	headerHtml: 'Add Search Condition',
	criteria: [
		{"field":"course__dept_name", "label":"Department Code", "field_filters":["contains", "iexact", "startswith", "endswith"]},
		{"field":"course__crs_code", "label":"Course Code", "field_filters":["exact", "gt", "gte", "lt", "lte", "range"]},
		{"field":"instructor", "label":"Instructor", "field_filters":["contains", "iexact", "startswith", "endswith"]},
		{"field":"course__crs_dec", "label":"DEC", "field_filters":["contains", "iexact", "startswith", "endswith"]},
		{"field":"sec_type", "label":"Section Type", "field_filters":["contains", "iexact", "startswith", "endswith"]},
		{"field":"sec_num", "label":"Section Number", "field_filters":["contains", "iexact", "startswith", "endswith"]},
		{"field":"crs_id", "label":"ID", "field_filters":["exact", "gt", "gte", "lt", "lte", "range"]},
		{"field":"days", "label":"Days", "field_filters":["contains", "iexact", "startswith", "endswith"]}
	]
});