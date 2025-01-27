#!/bin/sh

USERID=rules
GROUPID=rules
id -g ${GROUPID}
if [ $? -eq 1 ]; then
    groupadd rules
fi

id ${USERID}
if [ $? -eq 1 ]; then
    useradd -g rules rules
    useradd -g rules ec2-user
    usermod -aG wheel rules
    echo "rules ALL = (ALL) NOPASSWD: ALL" | sudo EDITOR='tee -a' visudo
fi

chown -R rules:rules /opt/rules-server
chgrp -R rules /opt/rules-server
chmod -R 770 /opt/rules-server
cd /opt/rules-server
sudo -H -u rules bash -c "PM2_HOME=/etc/pm2deamon pm2 stop rules-server && PM2_HOME=/etc/pm2deamon OPENCHS_UPLOAD_USER_USER_NAME=$1 OPENCHS_UPLOAD_USER_PASSWORD=$2 NODE_ENV=production pm2 start app.js --name rules-server --update-env"
