Using evolvus-mongo-seed, we can create objects for every module for that particular tenantId.

1.data => data folder like templates,which contains all the default module objects like applications, menus, etc.,

2.context.js => Here we have to configure which tenantId and that tenantId value.Not only tenantId.whatever attribute and value  you can

3.dbconfig.js => Here your database configuration.which port and which collection,these are all you have to configure here.
${dir} this mention output folder file.

4.fileConfig.js =>Here,there are three attribute .

1.template:mentionn your template file,
2.context:mention your context file,
3.output:mention your output folder

Note: template file must be .vm format

api/mongoseed/tenantId=T001 this is api for mongoseed

after mongoseed/ you have to set your attributename and value.Then it will change in wherever make it $tenantId it will repalce with T001



    

