
Oskari.clazz.define('Oskari.mapframework.publisher.tool.MapRotator',
function() {
}, {
  index : 500,
  allowedLocations : ['top left', 'top right'],
  lefthanded: 'top left',
  righthanded: 'top right',
  allowedSiblings : [],
  templates: {
      'toolOptions': '<div class="tool-options"></div>'
  },
  supportedProjections: null,
  noUI: null,
  projectionTrasformationIsCheckedInModifyMode: false,
  noUiIsCheckedInModifyMode: false,
  started: false,
  /**
  * Get tool object.
  * @method getTool
  *
  * @returns {Object} tool description
  */
  getTool: function() {
      return {
          id: 'Oskari.mapping.maprotator.plugin.MapRotatorPlugin',
          title: 'MapRotator',
          config: {
              instance: this.getMapRotatorInstance()
          }
      };
  },
  isDisplayed: function() {
    // shouldn't be shown if bundle is not started
    // otherwise results in js errors
    return !!this.getMapRotatorInstance();
  },
  getMapRotatorInstance : function() {
    return this.__sandbox.findRegisteredModuleInstance(this.bundleName);
  },
  getPlugin: function(){
    var maprotator = this.getMapRotatorInstance() || {};
    return maprotator.plugin;
  },
  //Key in view config non-map-module-plugin tools (for returning the state when modifying an existing published map).
  bundleName: 'maprotator',
  /**
   * Initialise tool
   * @method init
   */
  init: function(data) {
      var me = this;
      if ( !data || !data.configuration[me.bundleName] ) {
          return;
      }
        me.setEnabled(true);

  },
  /**
  * Set enabled.
  * @method setEnabled
  * @public
  *
  * @param {Boolean} enabled is tool enabled or not
  */
  setEnabled : function(enabled) {
      var me = this,
          tool = me.getTool(),
          request;

      if(me.started){
        tool.config.instance.stop();
        me.started = false;
      }
      me.state.enabled = enabled;
      if(tool.config.instance.plugin === null && enabled) {
        tool.config.instance.createPlugin(true, true);
        me.started = true;
      }
  },
  /**
  * Get values.
  * @method getValues
  * @public
  *
  * @returns {Object} tool value object
  */
  getValues: function () {
      var me = this;

      if(me.state.enabled) {
          return {
              configuration: {
                  maprotator: {

                  }
              }
          };
      } else {
          return null;
      }
  },
  /**
  * Get extra options.
  * @method @public getExtraOptions
  * @param {Object} jQuery element toolContainer
  * @return {Object} jQuery element template
  */
  getExtraOptions: function (toolContainer) {
    //CREATE CHECKBOX
    var me = this,
        template = jQuery(me.templates.toolOptions).clone(),
        labelNoUI = "Hide UI";
    var input = Oskari.clazz.create(
        'Oskari.userinterface.component.CheckboxInput'
    );

    input.setTitle( labelNoUI );
    input.setHandler( function( checked ) {
        if( checked === 'on' ){
            me.noUI = true;
            me.getPlugin().teardownUI();
        } else {
            me.noUI = null;
            me.getPlugin().redrawUI(Oskari.util.isMobile());
        }
    });
    var inputEl = input.getElement();
    template.append(inputEl);

    return template;

  }
}, {
    'extend' : ['Oskari.mapframework.publisher.tool.AbstractPluginTool'],
    'protocol' : ['Oskari.mapframework.publisher.Tool']
});
