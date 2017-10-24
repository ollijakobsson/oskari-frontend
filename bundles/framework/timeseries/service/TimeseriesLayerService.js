/**
 * @class Oskari.mapframework.bundle.timeseries.TimeseriesLayerService
 *
 * Keeps track of visible layers that have timeseries functionality
 * Registers clazzes to be used as animators for specific layer types in timeseries
 */
Oskari.clazz.define(
    'Oskari.mapframework.bundle.timeseries.TimeseriesLayerService',
    /**
     * @method create called automatically on construction
     * @static
     *
     * @param {Oskari.Sandbox} sandbox
     *          reference to application sandbox
     */
    function (sandbox, timeseriesService) {
        var me = this,
            p;

        me._layerTypeAnimators = {};
        me._timeseriesService = timeseriesService;
        me._sandbox = sandbox;
        me._popupService = sandbox.getService('Oskari.userinterface.component.PopupService');
        me.loc = Oskari.getMsg.bind(null, 'timeseries');
        me._log = Oskari.log('TimeseriesLayerService');
        for (p in me.__eventHandlers) {
            if (me.__eventHandlers.hasOwnProperty(p)) {
                me._sandbox.registerForEventByName(me, p);
            }
        }
    }, {
        /** @static @property __qname fully qualified name for service */
        __qname: 'Oskari.mapframework.bundle.timeseries.TimeseriesLayerService',
        /**
         * @method getQName
         * @return {String} fully qualified name for service
         */
        getQName: function () {
            return this.__qname;
        },
        /** @static @property __name service name */
        __name: "TimeseriesLayerService",
        /**
         * @method getName
         * @return {String} service name
         */
        getName: function () {
            return this.__name;
        },
        /**
         * @static @property {Object} __eventHandlers
         */
        __eventHandlers: {
            'AfterRearrangeSelectedMapLayerEvent': function (event) {
                this.updateTimeseriesLayers();
            },
            'AfterMapLayerAddEvent': function (event) {
                this.updateTimeseriesLayers();
            },
            'AfterMapLayerRemoveEvent': function (event) {
                var series = this._timeseriesService.unregisterTimeseries(event.getMapLayer().getId(), 'layer');
                series.delegate.destroy();
                this.updateTimeseriesLayers();
            }
        },
        /**
         * @method _checkMultipleLayers
         * @private
         * Show popup if there are more than one selected timeseries layers
         */
        _checkMultipleLayers: function () {
            if (this._timeseriesService.getCountByType('layer') > 1) {
                this._popupService.closeAllPopups(false);
                var popup = this._popupService.createPopup();
                var closeBtn = Oskari.clazz.create('Oskari.userinterface.component.Button');
                closeBtn.setTitle(this.loc('alert.ok'));
                closeBtn.setHandler(function () {
                    popup.close(true);
                });
                popup.show(this.loc('alert.title'), this.loc('alert.message'), [closeBtn]);
            }
        },
        /**
         * @public @method onEvent
         * Event is handled forwarded to correct eventHandlers if found or discarded if not.
         * @param {Oskari.mapframework.event.Event} event a Oskari event object
         */
        onEvent: function (event) {
            var handler = this.__eventHandlers[event.getName()];
            if (!handler) {
                return;
            }
            return handler.apply(this, [event]);
        },
        /**
         * @method registerLayerType
         * Registers animator/delegate class name for certain type of layer
         * @param {String} type layer type (AbstractLayer.getLayerType())
         * @param {String} className class name to use for layer type
         */
        registerLayerType: function (type, className) {
            this._layerTypeAnimators[type] = className;
        },
        /**
         * @method _layerDelegateFactory
         * @private
         * Requests change in current selected time
         * @param {String} layerId id of layer
         * @param {String} layerType type of layer (AbstractLayer.getLayerType())
         * @return {Oskari.mapframework.bundle.timeseries.TimeseriesDelegateProtocol} doneCallback callback that will be called after new time has been loaded
         */
        _layerDelegateFactory: function (layerId, layerType) {
            var animatorClassName = this._layerTypeAnimators[layerType];
            if (!animatorClassName) {
                this._log.warn('No animator defined for layer type "' + layerType + '"!');
                return;
            }
            return Oskari.clazz.create(animatorClassName, this._sandbox, layerId);
        },
        /**
         * @method updateTimeseriesLayers
         * Update timeseries service state based on current selected layers
         */
        updateTimeseriesLayers: function () {
            var me = this,
                layers = me._sandbox.findAllSelectedMapLayers();
            for (var i = 0; i < layers.length; i++) {
                if (layers[i].hasTimeseries()) {
                    var layer = layers[i];
                    var series = this._timeseriesService.getTimeseries(layer.getId(), 'layer');
                    if (!series) {
                        var delegate = me._layerDelegateFactory(layer.getId(), layer.getLayerType());
                        if(!delegate) {
                            continue;
                        }
                        this._timeseriesService.registerTimeseries(layer.getId(), 'layer', -i, delegate);
                    } else {
                        this._timeseriesService.updateTimeseriesPriority(layer.getId(), 'layer', -i);
                    }
                }
            }
            me._checkMultipleLayers();
        }
    });
