module.exports.configure = [{
    template: './data/applications.vm',
    context: './context.js',
    output: './output/1-applications/applications.js'
  },
  {
    template: './data/entities.vm',
    context: './context.js',
    output: './output/2-entities/entities.js'
  },
  {
    template: './data/masterCurrencies.vm',
    context: './context.js',
    output: './output/5-masterCurrencies/masterCurrencies.js'
  },
  {
    template: './data/masterTimeZones.vm',
    context: './context.js',
    output: './output/6-masterTimeZones/masterTimeZones.js'
  },
  {
    template: './data/menus.vm',
    context: './context.js',
    output: './output/3-menus/menus.js'
  },
  {
    template: './data/roles.vm',
    context: './context.js',
    output: './output/4-roles/roles.js'
  },
  {
    template: './data/supportedDateFormats.vm',
    context: './context.js',
    output: './output/7-supportedDateFormats/supportedDateFormats.js'
  },
  {
    template: './data/tenants.vm',
    context: './context.js',
    output: './output/10-tenants/tenants.js'
  },
  {
    template: './data/users.vm',
    context: './context.js',
    output: './output/9-users/users.js'
  },
  {
    template: './data/lookups.vm',
    context: './context.js',
    output: './output/8-lookups/lookups.js'
  },
  {
    template: './data/contacts.vm',
    context: './context.js',
    output: './output/11-contacts/contacts.js'
  },
  {
    template: './data/sweSetups.vm',
    context: './context.js',
    output: './output/12-sweSetups/swesetups.js'
  }

];