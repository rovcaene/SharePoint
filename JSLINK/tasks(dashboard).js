var U2U = U2U || {};

// To not break the default rendering of task lists
// http://www.eliostruyf.com/applying-js-link-on-task-lists-breaks-the-default-rendering-of-the-checkboxes/
RegisterSod('hierarchytaskslist.js', '/_layouts/15/hierarchytaskslist.debug.js');
LoadSodByKey('hierarchytaskslist.js', null);

U2U.RegisterTemplateOverrides = function () {
    // Fields template registration
    var overrideCtx = {
        Templates: {
            Fields: {
				'DueDate':
                    {
                        'View': U2U.RenderDueDate
                    },
                'PercentComplete':
                    {
                        'View': U2U.RenderPercentCompleteView
                    }
            },
			ListTemplateType: 171
        }
    };
    SPClientTemplates.TemplateManager.RegisterTemplateOverrides(overrideCtx);
};

U2U.RenderDueDate = function (ctx) {
    var value = ctx.CurrentItem[ctx.CurrentFieldSchema.Name];

    var date = new Date(value);
    var today = new Date();

    return (date < today) ? '<b>' + value + '</b>' : value;
};

U2U.RenderPercentCompleteView = function (ctx) {
    var value = ctx.CurrentItem[ctx.CurrentFieldSchema.Name];

    // .ms-TopBarBackground-bgColor
    // .ms-EmphasisBackground-bgColor

    var output = [];
    output.push('<div style="display:block; height: 20px; width: 100px;" class="ms-TopBarBackground-bgColor">');
    output.push('<span style="color: #fff; position:absolute; text-align: center; width: 100px;">');
    output.push(value);
    output.push('</span>');
    output.push('<div style="height: 100%; width: ');
    output.push(value.replace(" %", ""));
    output.push('%;" class="ms-EmphasisBackground-bgColor"></div></div>');
    return output.join('');
};

ExecuteOrDelayUntilScriptLoaded(
	function(){
		//Register for MDS enabled site otherwise the display template doesn't work on refresh
		U2U.sitePath = window.location.pathname.substring(0, window.location.pathname.indexOf("/_layouts/15/start.aspx"));
		// CSR-override for MDS enabled site
		RegisterModuleInit(U2U.sitePath + "/SiteAssets/JSLINK/tasks.js", U2U.RegisterTemplateOverrides);
		//CSR-override for MDS disabled site
		U2U.RegisterTemplateOverrides(); 
	},
	'hierarchytaskslist.js');

// Now override the RenderListView once the ClientTemplates.JS has been called
ExecuteOrDelayUntilScriptLoaded(
    function () {
        //Take a copy of the existing definition of RenderListView
        var originalRenderListView = RenderListView;

        //Now redefine RenderListView with our override
        RenderListView = function (ctx, webPartID) {			
			ExecuteOrDelayUntilScriptLoaded(
				function(){
					// Call the original RenderListView
					originalRenderListView(ctx, webPartID);
				},
				'hierarchytaskslist.js');
        };
    }, 'clienttemplates.js');