/*jslint browser: true*/
/*global $, jQuery, alert*/
(function($) {
    'use strict';

    $(function() {

        $(document).ready(function() {
            function triggerClick(elem) {
                $(elem).click();
            }
            var $progressWizard = $('.stepper'),
                $tab_active,
                $tab_prev,
                $tab_next,
                $btn_prev = $progressWizard.find('.prev-step'),
                $btn_next = $progressWizard.find('.next-step'),
                $tab_toggle = $progressWizard.find('[data-toggle="tab"]'),
                $tooltips = $progressWizard.find('[data-toggle="tab"][title]');


            //Initialize tooltips
            $tooltips.tooltip();

            //Wizard
            $tab_toggle.on('show.bs.tab', function(e) {
                var $target = $(e.target);

                if (!$target.parent().hasClass('active, disabled')) {
                    $target.parent().prev().addClass('completed');
                }
                if ($target.parent().hasClass('disabled')) {
                    return false;
                }
            });

            $btn_next.on('click', function() {
                $tab_active = $progressWizard.find('.active');

                $tab_active.next().removeClass('disabled');

                $tab_next = $tab_active.next().find('a[data-toggle="tab"]');
                triggerClick($tab_next);

            });
            $btn_prev.click(function() {
                $tab_active = $progressWizard.find('.active');
                $tab_prev = $tab_active.prev().find('a[data-toggle="tab"]');
                triggerClick($tab_prev);
            });

            /*
            Function to diplsay the card details as JSON as we type // TODO : Cookie Points
             */
            $(".form-control").keyup(function () {
                // var app="{\n" + "\t" + "card: {\n"
                // $(".form-control").each(function () {
                //     if( $(this).val() ) {
                //         var value=$(this).val();
                //         var name=$(this).attr('name');
                //         app +="\t\t\t"+value+"*"+name+ "\n" ;
                //     }
                // });
                // $("#token-payload").text(app);

            });

            /*
            Display JSON Payload
             */

            $("#createtoken").click(function(e) {

                var card = {};
                var exp = $('#expYear').val().split('/');
                card.expYear = exp[1];
                card.expMonth = exp[0];
                card.address = {};
                card.address.region = $('#state').val();
                card.address.postalCode = $('#postalCode').val();
                card.address.streetAddress = $('#streetAddress').val();
                card.address.country = 'US';
                card.address.city = $('#city').val();
                card.name = $('#name').val();
                card.cvc = $('#cvc').val();
                card.number = $('#cardNumber').val();

                var cardObj = {"card":card};

                $("#token-payload").text(JSON.stringify(cardObj, null, 2));
                e.preventDefault();

                var baseUrl = "https://sandbox.api.intuit.com/quickbooks/v4/payments/tokens";
                $.ajax({
                    url: baseUrl,
                    data: JSON.stringify(cardObj),
                    type: 'POST',
                    dataType: "text",
                    headers: {"Content-Type": "application/json"},
                    success: function (resp) {
                        alert(resp);
                        $("#token-result").text(resp);
                    },
                    error: function(e) {
                        $("#token-result").text(e);
                    }
                });

            });

            /*
            Function to Authorize the Purchase
             */
            $('#authorizePurchase').click(function(e){

                e.preventDefault();

                var jsonBody = {};
                jsonBody.amount = $('#amount1').val();
                jsonBody.capture = false;
                jsonBody.currency = $('#currency').val();
                jsonBody.token = $('#token').val();
                jsonBody.context = {};
                jsonBody.context.mobile = false;
                jsonBody.context.isEcommerce = true;

                $("#amount2").val(jsonBody.amount);

                $.post('/authorizePurchase', {json:jsonBody}, function(data) {

                    var json = JSON.stringify(data, null, 2);
                    $("#purchase-result").text(json);
                });
            });

            /*
            Function to Capture Charge
             */
            $('#captureCharge').click(function(e){

                e.preventDefault();
                var jsonBody = {};
                jsonBody.amount = $('#amount2').val();
                jsonBody.context = {};
                jsonBody.context.mobile = false;
                jsonBody.context.isEcommerce = true;

                console.log('The JSON Body is : '+ JSON.stringify(jsonBody.amount));


                $.post('/captureCharge', {json:jsonBody}, function(data) {
                    var json = JSON.stringify(data, null, 2);
                    console.log("The data returned is :" + json);
                    $("#capture-result").text(json);
                });
            });

        });
    });

}(jQuery, this));