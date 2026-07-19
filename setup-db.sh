#!/bin/bash

echo "======================================================"
echo "   Sunrise Medical - Automated Database Setup"
echo "======================================================"
echo ""
echo "This script will create the 'sdcms_db' database and 'sdcms_user'."
echo "It requires 'psql' to be installed."
echo ""
echo "When prompted for a password, please enter the password for your main 'postgres' administrator account."
echo ""

psql -U postgres -c "CREATE USER sdcms_user WITH PASSWORD 'sdcms_password';"
psql -U postgres -c "CREATE DATABASE sdcms_db OWNER sdcms_user;"

echo ""
echo "======================================================"
echo "Done! If you didn't see any fatal errors above, the database is ready."
echo "You can now run './start-dev.sh' to launch the app!"
echo "======================================================"
