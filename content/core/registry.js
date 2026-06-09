window.UTC_Vuz = window.UTC_Vuz || {};

window.UTC_Vuz.registry = {
  controller: {},
  modules: {},
  state: {},
};

window.UTC_Vuz.register = function (type, name, module) {
  window.UTC_Vuz.registry[type][name] = module;
};
