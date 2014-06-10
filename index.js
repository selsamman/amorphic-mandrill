module.exports.mandrill_mixins = function (objectTemplate, requires, mixinConfig, nconf)
{
    var Controller = requires[mixinConfig.controller.require][mixinConfig.controller.template];
    if (typeof(require) != "undefined") {
        var Q = require('q');
        var mandrillAPI = nconf.get('mandrillAPIKey') ? Q.nbind(require('node-mandrill')(nconf.get('mandrillAPIKey'))) : null;
    }

    Controller.mixin(
        {
            /**
             * Send an email with mandrill (note we return immediately success or fail)
             *
             * @param template
             * @param email
             * @param name
             * @param vars
             * @return {*}
             */

            sendEmail: function (template, email, name, vars)
            {
                if (mandrillAPI)
                    mandrillAPI('/messages/send-template', {
                        template_name: template,
                        template_content: [
                            {name: "foo", content: "bar"}
                        ],
                        message: {
                            to: [{
                                email: email,
                                name: name
                            }],
                            from_email: mixinConfig.senderEmail,
                            from_name:  mixinConfig.senderName,
                            global_merge_vars: vars
                        }
                    }).then(function (results) {
                        if (results.length > 0 && results[0].status != "sent")
                            this.log(0, "Mandrill - error sending " + template + " to " + email + " - " +
                                results[0].reject_reason);
                    }.bind(this), function(error) {
                        this.log(0, "Mandrill - error sending " + template + " to " + email + " - " + error.message);
                    }.bind(this));
                else
                    this.log(0, "Mandrill - error sending " + template + " to " + email +
                        " - Missing API Key (should be in environment variable mandrillAPIKey)");
            }

        });
}
