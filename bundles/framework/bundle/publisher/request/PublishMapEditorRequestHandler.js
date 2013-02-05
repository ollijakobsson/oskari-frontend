/**
 * @class Oskari.mapframework.bundle.publisher.request.PublishMapEditorRequestHandler
 * Requesthandler for editing own map in pulish mode
 */
Oskari.clazz.define('Oskari.mapframework.bundle.publisher.request.PublishMapEditorRequestHandler', 
/**
 * @method create called automatically on construction
 * @static
 * @param {Oskari.mapframework.sandbox.Sandbox} sandbox
 *          reference to application sandbox
 */
function(instance) {
    this.instance = instance;
}, {
    /**
     * @method handleRequest 
     * Shows/hides the maplayer specified in the request in OpenLayers implementation.
     * @param {Oskari.mapframework.core.Core} core
     *      reference to the application core (reference sandbox core.getSandbox())
     *      request to handle
     */
    handleRequest : function(core, request) {
        this.instance.publishId  = request.getEditMap().id;
        this.instance.setPublishMode(true, this.instance.getLayersWithoutPublishRights(), request.getEditMap());
   },
     /**
     * @method _showEditNotification
     * Shows notification about edit publish map data
     * @private
     */
    _showEditNotification : function(view) {
        var loc = this.instance.getLocalization('edit');
        var dialog = Oskari.clazz.create('Oskari.userinterface.component.Popup');
        dialog.show(loc.popup.title, loc.popup.msg);
        dialog.fadeout();
    }
}, {
    /**
     * @property {String[]} protocol array of superclasses as {String}
     * @static
     */
    protocol : ['Oskari.mapframework.core.RequestHandler']
});
