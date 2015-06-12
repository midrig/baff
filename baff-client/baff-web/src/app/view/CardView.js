/**
 *  A CardView provides the view for a set of 'cards' typically provided by child instances of 
 *  {@link  Baff.app.view.FormView}. It is controlled by a {@link Baff.app.controller.CardController}
 *  and should be setup as a tab in a parent {@link  Baff.app.view.DomainView} configuration.
 * 
 *  It may also control a 'selector' that is used to select the entity to be presented in one of the cards,
 *  typically provided by a {@link Baff.app.view.TreeView}.
 *  
 *  A typical setup is as follows:
 * 
 *      Ext.define('MyApp.view.MyCardView', {
 *          extend: 'Baff.app.view.CardView',
 *          
 *          alias: 'widget.mycardview',
 *          
 *          requires: ['MyApp.view.MyTreeViewl',
 *                          'MyApp.view.MyCardA',
 *                          'MyApp.view.MyCardB',
 *                          'MyApp.view.MyCardC'],
 *   
 *          config : {
 *                    
 *                    controller: 'mycardcontroller',    // alias of MyApp.controller.MyCardController       
 *                    emptyCard: true, // To display an empty card if nothing is selected
 *                    
 *                    cards: [{
 *                                      xtype: 'mycarda'.  // alias of MyApp.view.MyCardA
 *                                      reference: 'mycarda'
 *                                 },
 *                                 {
 *                                      xtype: 'mycardb'.  // alias of MyApp.view.MyCardB
 *                                      reference: 'mycardb'
 *                                 },
 *                                 {
 *                                      xtype: 'mycardc'.  // alias of MyApp.view.MyCardC
 *                                      reference: 'mycardc'
 *                                 }]
 *                                        
 *           }
 *      });
 *           
 */
Ext.define('Baff.app.view.CardView', {
    extend: 'Ext.panel.Panel',
    xtype: 'cardview',   
 
    /**
     * The reference for the card container
     * @private
     */
    cardViewRef: 'cardview',
    
    /**
     * The reference for the selector
     * @private
     */
    selectorViewRef: 'selectorview',
    
    config: {
        
        /**
        * Specifies the {@link Baff.app.controller.CardDomainController} that controls this view
        */
        controller: 'carddomain',
        
        /**
         * Specifies the alias for the selector, typically a {@link Baff.app.view.TreeView}
         */
        selectorView: '',
        
        /**
         * The flex for the selector relative to the cards; both default to 10
         */
        selectorFlex: 10,
        
        /**
         * An array card item configurations 
         */
        cards: [],
        
        /**
         * Specifies to disable the refresh button for each card; this is typically not required if there is a selector
         * that supports refresh.
         */
        disableCardRefresh: true,
        
        /**
         * Specifies if an empty card should be displayed if nothing is selected, otherwise the first card will be
         * displayed. 
         * Set to true to display the default empty card or else provide a card configuraiton.
         */
        emptyCard: true,
        
        /**
         * The text to be displayed for the default empty card.
         */
        emptyCardText: 'Please select an item to view...'
 

    },

   // The following styles are required to ensure the background is painted correctly
    border: false,
    cls: 'x-tab x-tab-active x-tab-default',
    bodyPadding: 5,

    layout: {
        type: 'hbox',  
        align:'stretch' 
    },
    
    bodyStyle: {
            background: 'transparent'
        },

    /**
    * Creates the view components, using the specified configuration such as {@link #refreshButton}. etc.
    * Calls the overridden superclass method.    
    */          
    initComponent: function() {
        var me = this;
        
        var items = [];
        var selectorView = me.getSelectorView;
        
        if (selectorView != null && selectorView != '') {
            
            if (typeof selectorView == "object") {
                
                me.selectorViewRef = selectorView.reference;
            
            } else {
                
                me.selectorViewRef = me.getSelectorView();
            
                selectorView = {
                        xtype: me.selectorViewRef,
                        reference: me.selectorViewRef,
                        margin: '0 5 0 0',
                        flex: me.getSelectorFlex()
                    };
            }
        
            items.push(selectorView);
        
        }
        
        var cards = me.getCards();
        var emptyCard = me.getEmptyCard();
        
        if (me.getDisableCardRefresh()) {
            Ext.Array.each(cards, function(card) {
                card.refreshButton = '';
            });
        }
        
        if (typeof emptyCard == "object") {            
            cards.unshift(emptyCard);
        
        } else if (emptyCard == true) {
            
            emptyCard = {
                    xtype: 'container',
                    reference: 'emptyCard',
                    layout: {
                        type: 'hbox',
                        align: 'center'
                    },
                    items: [{
                        xtype: 'container',
                        flex: 1,
                        layout: {
                            type: 'vbox',
                            align: 'center'
                        },
                        items: [{
                                xtype: 'container',
                                flex: 1,
                                html: me.getEmptyCardText()
                        }]
                    }]
                };
                
            cards.unshift(emptyCard);     
        }
        
        var cardView = {
            xtype: 'container',
            reference: me.cardViewRef,
            flex: 10,
            layout: 'card',
            items: cards
        };
        
        items.push(cardView);
        
        Ext.apply(me, {
                items: items
        });
        
        me.callParent(arguments);      
        
    }
});