// import Vue from 'vue';
import Vue from 'vue/dist/vue.js';
import draggable from 'vuedraggable';
import VueTimeago from 'vue-timeago';
import VeeValidate from 'vee-validate';
import VueKanban from 'vue-kanban';

import './bootstrap';

window.Vue = Vue;
window.VeeValidate = VeeValidate;

Vue.use(VeeValidate, {
    events: 'input|change|blur',
});

Vue.prototype.$http = axios;

window.eventBus = new Vue();

Vue.use(VueKanban);
Vue.use(VueTimeago, {name: 'Timeago', locale: 'en'})

Vue.component('draggable', draggable);
Vue.component('kanban-component', require('./components/kanban').default);

$(function() {
    var app = new Vue({
        el: "#app",

        data: function () {
            return {
                pageLoaded: false,

                modalIds: {},
    
                isMenuOpen: localStorage.getItem('crm-sidebar') == 'true',
            }
        },

        mounted() {
            setTimeout(() => {
                this.pageLoaded = true;

                this.disableAutoComplete();
            });

            this.addServerErrors();
            
            this.addFlashMessages();

            window.addFlashMessages = flash => {
                const flashes = this.$refs.flashes;

                flashes.addFlash(flash);
            }
        },

        methods: {
            onSubmit: function (e, formScope = '') {
                this.toggleButtonDisable(true);

                if (typeof tinyMCE !== 'undefined') {
                    tinyMCE.triggerSave();
                }

                this.$validator.validateAll(formScope || null)
                    .then(result => {
                        if (result) {
                            e.target.submit();
                        } else {
                            this.toggleButtonDisable(false);

                            eventBus.$emit('onFormError')
                        }
                    });
            },

            toggleButtonDisable (value) {
                var buttons = document.getElementsByTagName("button");

                for (var i = 0; i < buttons.length; i++) {
                    buttons[i].disabled = value;
                }
            },

            addServerErrors(scope = null) {
                for (var key in serverErrors) {
                    var inputNames = [];
                    key.split('.').forEach(function(chunk, index) {
                        if(index) {
                            inputNames.push('[' + chunk + ']')
                        } else {
                            inputNames.push(chunk)
                        }
                    })

                    var inputName = inputNames.join('');

                    const field = this.$validator.fields.find({
                        name: inputName,
                        scope: scope
                    });

                    if (field) {
                        this.$validator.errors.add({
                            id: field.id,
                            field: inputName,
                            msg: serverErrors[key][0],
                            scope: scope
                        });
                    }
                }
            },

            addFlashMessages() {
                if (typeof flashMessages == 'undefined') {
                    return;
                };

                const flashes = this.$refs.flashes;

                flashMessages.forEach(function(flash) {
                    flashes.addFlash(flash);
                }, this);
            },

            openModal(id) {
                this.$set(this.modalIds, id, true);

                this.disableAutoComplete();
            },

            closeModal(id) {
                this.$set(this.modalIds, id, false);
            },

            toggleMenu() {
                this.isMenuOpen = ! this.isMenuOpen;

                localStorage.setItem('crm-sidebar', this.isMenuOpen);
            },

            disableAutoComplete: function () {
                queueMicrotask(() => {
                    $('.date-container input').attr('autocomplete', 'off');
                    $('.datetime-container input').attr('autocomplete', 'off');
                });
            }
        }
    });
});