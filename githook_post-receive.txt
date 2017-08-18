#!/bin/sh
GITDIR="/home/axel/git/mdwriter.git"
INTDIR="/home/axel/webapps/mdwriter"

echo "backup db ..."
cd ~
mongodump -d markdownstore -o ~/dumps/markdownstore_$(date "+%Y-%m-%d_%H-%M-%S")

echo "git checkout..."
git --work-tree=$INTDIR --git-dir=$GITDIR checkout -f

echo "npm install..."
cd $INTDIR
npm install

echo "build express app..."
npm run build-server

echo "build angular app..."
grunt build

echo "restart maus app via pm2"
# pm2 restart maus
pm2 stop maus
pm2 delete maus
pm2 start ~/webapps/mdwriter/server/server.js --name="maus"
