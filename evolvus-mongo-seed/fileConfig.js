const dir = process.env.SCRIPT_HOME || '/home/vigneshp/Documents/SA/Script';

module.exports.configure = [{
    template: './data/applications.vm',
    mkpath: `1-applications`,
    fileName: 'applications.js',
    outputdir: `${dir}`,
    context: './context.js',
    output: `${dir}/1-applications/applications.js`
  },
  {
    template: './data/entities.vm',
    mkpath: `2-entities`,
    fileName: 'entites.js',
    outputdir: `${dir}`,
    context: './context.js',
    output: `${dir}/2-entities/entities.js`
  }, {
    template: './data/mastercurrencies.vm',
    mkpath: `3-mastercurrencies`,
    fileName: 'mastercurrencies.js',
    outputdir: `${dir}`,
    context: './context.js',
    output: `${dir}/3-mastercurrencies/mastercurrencies.js`
  }, {
    template: './data/mastertimezones.vm',
    mkpath: `4-mastertimezones`,
    fileName: 'mastertimezones.js',
    outputdir: `${dir}`,
    context: './context.js',
    output: `${dir}/4-mastertimezones/mastertimezones.js`
  },
  {
    template: './data/menus.vm',
    mkpath: `5-menus`,
    fileName: 'menus.js',
    outputdir: `${dir}`,
    context: './context.js',
    output: `${dir}/5-menus/menus.js`
  }, {
    template: './data/roles.vm',
    mkpath: `6-roles`,
    fileName: 'roles.js',
    context: './context.js',
    outputdir: `${dir}`,
    output: `${dir}/6-roles/roles.js`
  },
  {
    template: './data/supporteddateformats.vm',
    mkpath: `7-supporteddateformats`,
    fileName: 'supporteddateformats.js',
    context: './context.js',
    outputdir: `${dir}`,
    output: `${dir}/7-supporteddateformats/supporteddateformats.js`
  }, {
    template: './data/tenants.vm',
    mkpath: `8-tenants`,
    fileName: 'tenants.js',
    context: './context.js',
    outputdir: `${dir}`,
    output: `${dir}/10-tenants/tenants.js`
  }, {
    template: './data/users.vm',
    mkpath: `9-users`,
    fileName: 'users.js',
    context: './context.js',
    outputdir: `${dir}`,
    output: `${dir}/9-users/users.js`
  },
  {
    template: './data/lookups.vm',
    mkpath: `10-lookups`,
    fileName: 'lookups.js',
    outputdir: `${dir}`,
    context: './context.js',
    output: `${dir}/8-lookups/lookups.js`
  },
  {
    template: './data/contacts.vm',
    mkpath: `11-contacts`,
    fileName: 'contacts.js',
    context: './context.js',
    outputdir: `${dir}`,
    output: `${dir}/11-contacts/contacts.js`
  },
  {
    template: './data/swesetups.vm',
    mkpath: `12-swesetups`,
    fileName: 'swesetups.js',
    context: './context.js',
    outputdir: `${dir}`,
    output: `${dir}/12-swesetups/swesetups.js`
  }
];