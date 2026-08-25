@echo off
echo Importing database schema and data from database/schema_utf8.sql...
docker exec -i smart_bake_hub_db mysql -uroot -ppassword smart_bake_hub < database/schema_utf8.sql
echo Database import complete!
pause
