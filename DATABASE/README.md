# DATABASE CONFIG
- Specificaly use MSSQL Server 2008 (LEGACY)
- Set Username: 'sa' as default user
- Set Password: 'innosoft@2024' as default password
- Port 1433 is the default port of MSSQL Server

- The backup database only works on MSSQL Server with the same version
- else use the script instead to create the dataase
```
  [2024-06-18] Backup Date innosoft_tms.bak
  // has default data
  // tables are not updated
  // missing table `ClientLine`
  // missing table `LicenseRequest`
  // missing fields on Setup `IsDeleted` & `DeletedBy`
```
