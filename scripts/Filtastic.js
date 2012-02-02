(function(){
var Filtastic=this.Filtastic={
	editors:{},
	editorNames:{
		'exact': '=',
		'iexact': 'is exactly',
		'contains': 'contains',
		'gt': '>',
		'gte': '>=',
		'lt': '<',
		'lte': '<=',
		'startswith': 'starts with',
		'endswith': 'ends with',
		'range': 'is between',
		'dexact': 'is',
		'dgt': 'is after',
		'dgte': 'is not before',
		'dlt': 'is before',
		'dlte': 'is not after',
		'drange': 'is between'
	}
};
Filtastic.FilterEditor = new Class({
    version: '0.1',
    Implements: [Options, Events],
    Binds: ['addNewRow', 'removeRow', 'onChanged', 'triggerSearch'],
    options: {
    	headerHtml: "",
        /*
        container: $empty,
        onStartLoad: $empty,
        onLoad: $empty,
        onError: $empty
        */
    },
    initialize: function(options){
        this.setOptions(options);
        this.setUpData();
        this.setUpGUI();
        this.setUpEvents();
    },
    setUpData:function(){
    	this.data={criteria:{}, rules:[], count:0};
    	this.options.criteria.each(function(item){
    		this.data.criteria[item.field]=item;
    	}.bind(this));
    },
    setUpGUI: function(){
    	this.gui={};
    	this.gui.container=document.id(this.options.container);
    	this.gui.wrapper = new Element('div',{
    		'class': 'ft-wrapper'
    	});
    	this.gui.ruleMenu = new Element('div',{
    		'class': 'ft-rule-menu'
    	});
    	
    	this.gui.menu_add_button=new Element('div',{
    		id: 'ft-menu_add_button',
    		'class': 'ft-rule-button plus'
    	}).inject(this.gui.ruleMenu);
    	if(this.options.headerHtml!=""){
	    	this.gui.menu_search_button = new Element('div',{
	    		'class': 'ft-rule-menu-extra',
	    		'html': this.options.headerHtml
	    	}).inject(this.gui.ruleMenu);
    	}
    	this.gui.ruleMenu.inject(this.gui.wrapper);
    	this.gui.ruleList = new Element('div',{
    		'class': 'ft-rule-list'
    	}).inject(this.gui.wrapper);
    	this.gui.wrapper.inject(this.gui.container);
    },
    setUpEvents: function(){
    	this.gui.menu_add_button.addEvent('click', this.addNewRow);
    	/*this.gui.menu_search_button.addEvent('click', this.triggerSearch);*/
    },
    triggerSearch: function(){
    	this.fireEvent('search');
    },
    addNewRow: function(){
    	var row = new Element('div',{
    		'class': 'ft-rule-row',
    	})
    	var row_editor=new Filtastic.RowEditor({
    		container: row,
    		fields: this.data.criteria,
    		count: this.data.count++,
    		onAddNewRow: this.addNewRow,
    		onRemoveRow: this.removeRow,
    		onChange: this.onChanged
    	});
    	this.data.rules.push(row_editor);
    	row.inject(this.gui.ruleList);
    	this.onChanged();
    },
    removeRow: function(row_editor){
    	this.data.rules.erase(row_editor);
    	this.data.count--;
    	this.onChanged();
    },
    onChanged:function(){
    	this.fireEvent('change');
    },
    getArguments:function(){
    	return this.data.rules.map(function(item){
    		return item.getArguments();
    	});
    }
});
Filtastic.RowEditor = new Class({
    Implements: [Options, Events],
    Binds: ['onChange', 'onChanged', 'addNewRow', 'removeRow'],
    options: {
        /*
        container: $empty
        onChange: $empty,
        onLoad: $empty,
        onError: $empty
        */
    },
    initialize: function(options){
        this.setOptions(options);
        this.fields=this.options.fields;
        this.setUpAll();
    },
	setUpAll: function(){
		this.setUpGUI();
	},
	setUpGUI: function(){
		this.container=document.id(this.options.container);
		var button_group=new Element('div',{
			'class': 'ft-rule-button-group'
		}).inject(this.container);
		var add_button=new Element('div',{
			'class': 'ft-rule-button plus',
			'events': {
				'click': this.addNewRow
			}
		}).inject(button_group);
		var remove_button=new Element('div',{
			'class': 'ft-rule-button minus',
			'events': {
				'click': this.removeRow
			}
		}).inject(button_group);
		var select = new Element('select',{
			'class': 'ft-select',
			events:{
				'change': this.onChange
			}
		});
		var t=0;
		var k=0;
		Object.each(this.fields, (function(item, index){
			var option = new Element('option', {
				'text': item.label,
				'value': item.field,
			}).inject(select);
			if(t++==this.options.count){
				option.set('selected', 'selected');
				k=t-1;
			}
		}).bind(this));
		select.inject(this.container);
		this.ruleEditorWrapper = new Element('div',{
			'class': 'ft-rule-editor-wrapper'
		}).inject(this.container);
		
		this.renderRuleEditor(Object.values(this.fields)[k].field);
	},
	onChange: function(event){
		var field = event.target.getSelected()[0].get('value');
		this.renderRuleEditor(field);
		this.onChanged();
	},
	renderRuleEditor: function(fieldValue){
		this.ruleEditorWrapper.empty();
		this.currentField=fieldValue;
		this.currentEditor = new Filtastic.RuleEditor({
			'container': this.ruleEditorWrapper,
			'field': this.fields[this.currentField],
			'onChange': this.onChanged
		})
	},
	onChanged: function(){
		this.fireEvent('change');
	},
	addNewRow: function(){
		this.fireEvent('addNewRow');
	},
	removeRow: function(){
		this.container.destroy();
		this.fireEvent('removeRow', [this]);
	},
	getArguments:function(){
		return Object.merge(this.currentEditor.getArguments(), {'field': this.currentField});
	}
});
Filtastic.RuleEditor = new Class({
    Implements: [Options, Events],
    Binds: ['onChange', 'onChanged'],
    options: {
        /*
        container: $empty
        onChange: $empty,
        onLoad: $empty,
        onError: $empty
        */
    },
    initialize: function(options){
        this.setOptions(options);
        this.field=this.options.field;
        this.field_filters=this.field.field_filters;
        this.setUpAll();
    },
	setUpAll: function(){
		this.setUpGUI();
	},
	setUpGUI: function(){
		this.container=document.id(this.options.container);
		var select = new Element('select',{
			'class': 'ft-select',
			events:{
				'change': this.onChange
			}
		});
		this.field_filters.each(function(item){
			var label = Filtastic.editorNames[item];
			var option = new Element('option', {
				'text': label,
				'value': item,
			}).inject(select);
		});
		select.inject(this.container);
		this.criteriaEditorWrapper = new Element('div',{
			'class': 'ft-criteria-editor-wrapper'
		});
		this.criteriaEditorWrapper.inject(this.container);
		this.renderCriteriaEditor(this.field_filters[0]);
	},
	onChange: function(event){
		var criteria = event.target.getSelected()[0].get('value');
		this.renderCriteriaEditor(criteria);
		this.onChanged();
	},
	onChanged: function(){
		this.fireEvent('change');
	},
	renderCriteriaEditor: function(criteria){
		this.criteriaEditorWrapper.empty();
		this.currentCriteria=criteria;
		this.currentEditor = new (Filtastic.editors[criteria])({
			'container': this.criteriaEditorWrapper,
			'onChange': this.onChanged
		})
	},
	getArguments:function(){
		return {'field': this.field.field, 'method': this.currentCriteria, 'arg': this.currentEditor.getArguments()};
	}
});
Filtastic.CriteriaEditor = new Class({
    Implements: [Options, Events],
    options: {
        /*
        container: $empty
        onChange: $empty,
        onLoad: $empty,
        onError: $empty
        */
    },
    initialize: function(options){
        this.setOptions(options);
        this.setUpAll();
    },
    setUpAll: function(){
    },
    onChange: function(){
    	this.fireEvent('change');
    },
    getArguments:function(){
    	return {};
    }
    
});
Filtastic.SingleCriteriaEditor = new Class({
    Extends: Filtastic.CriteriaEditor,
    Binds: ['onChange'],
    options: {
        /*
        onChange: $empty,
        onLoad: $empty,
        onError: $empty
        */
    },
    setUpAll: function(){
    	this.setUpGUI();
    },
    setUpGUI: function(){
    	this.container=document.id(this.options.container);
    	this.field=new Element('input', {
    		'class': 'ft-text-field',
    		events: {
    			change: this.onChange,
    			keyup: this.onChange,
    		}
    	}).inject(this.container);
    },
    getArguments:function(){
    	return this.field.value;
    }
});

Filtastic.RangeCriteriaEditor = new Class({
    Extends: Filtastic.SingleCriteriaEditor,
    options: {
    	label: 'and'
    },
    setUpAll: function(){
    	this.setUpGUI();
    },
    setUpGUI: function(){
    	this.container=document.id(this.options.container);
    	this.field1=new Element('input', {
    		'class': 'ft-text-field',
    		events: {
    			change: this.onChange,
    			keyup: this.onChange,
    		}
    	}).inject(this.container);
    	this.label=new Element('div', {
    		'class': 'ft-text-label',
    		'text': this.options.label
    	}).inject(this.container);
    	this.field2=new Element('input', {
    		'class': 'ft-text-field',
    		events: {
    			change: this.onChange,
    			keyup: this.onChange,
    		}
    	}).inject(this.container);
    },
    getArguments:function(){
    	return [this.field1.value, this.field2.value];
    }
});

Filtastic.SingleDateCriteriaEditor = new Class({
    Extends: Filtastic.SingleCriteriaEditor,
    Binds: ['onChange'],
    options: {
        /*
        onChange: $empty,
        onLoad: $empty,
        onError: $empty
        */
    },
    setUpGUI: function(){
    	this.container=document.id(this.options.container);
    	this.field=new Element('input', {
    		'class': 'ft-text-field ft-date-field',
    		events: {
    			change: this.onChange,
    			keyup: this.onChange,
    		}
    	}).inject(this.container);
    	this.picker = new DatePicker(this.field, {
    	    pickerClass: 'datepicker_dashboard',
    	    draggable: false,
    	    format: '%Y-%m-%d'
    	});
    },
    getArguments:function(){
    	return this.field.value;
    }
});

Filtastic.RangeDateCriteriaEditor = new Class({
    Extends: Filtastic.SingleCriteriaEditor,
    options: {
    	label: 'and'
    },
    setUpAll: function(){
    	this.setUpGUI();
    },
    setUpGUI: function(){
    	this.container=document.id(this.options.container);
    	this.field1=new Element('input', {
    		'class': 'ft-text-field ft-date-field',
    		events: {
    			change: this.onChange,
    			keyup: this.onChange,
    		}
    	}).inject(this.container);
    	this.picker1 = new DatePicker(this.field1, {
    	    pickerClass: 'datepicker_dashboard',
    	    draggable: false,
    	    format: '%Y-%m-%d'
    	});
    	this.label=new Element('div', {
    		'class': 'ft-text-label',
    		'text': this.options.label
    	}).inject(this.container);
    	this.field2=new Element('input', {
    		'class': 'ft-text-field',
    		events: {
    			change: this.onChange,
    			keyup: this.onChange,
    		}
    	}).inject(this.container);
    	this.picker2 = new DatePicker(this.field2, {
    	    pickerClass: 'datepicker_dashboard',
    	    draggable: false,
    	    format: '%Y-%m-%d'
    	});
    },
    getArguments:function(){
    	return [this.field1.value, this.field2.value];
    }
});

['exact', 'iexact', 'contains', 'gt', 'gte', 'lt', 'lte', 'startswith', 'endswith'].each(function(item){
	Filtastic.editors[item]=Filtastic.SingleCriteriaEditor;
}.bind(this));
['dexact', 'dgt', 'dgte', 'dlt', 'dlte'].each(function(item){
	Filtastic.editors[item]=Filtastic.SingleDateCriteriaEditor;
}.bind(this));
Filtastic.editors['drange']=Filtastic.RangeDateCriteriaEditor;
Filtastic.editors['range']=Filtastic.RangeCriteriaEditor;
})();