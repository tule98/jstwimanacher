# redis cli
# connect to redis localhost 2379
redis-cli -h localhost -p 2379
# list all keys
keys *
# list keys with pattern start with ope
keys ope*
# remove key
del <key_name>

# create pull request from branch gcloud-sh to main


# setup keygen ed25519
ssh-keygen -t ed25519 -f ~/.ssh/metabase-pito-vn-vm -C tu_le -N "" # -t type, -f file, -C comment, -N passphrase

# create new user on vm: sysadmin
sudo adduser sysadmin
sudo usermod -aG sudo sysadmin # -aG: append to group

# view user permissions
groups tu_le

# view all groups
cut -d: -f1 /etc/group

# top IDE for coding
# top 1: vscode
# top 2: jetbrains fleet
# top 3: neovim


# ssh into vm metabase-pito-vn-vm zone asia-southeast1-a using ssh key
ssh -i ~/.ssh/metabase-pito-vn-vm tu_le@

# enable serial port on vm metabase-pito-vn-vm zone asia-southeast1-a
gcloud compute instances add-metadata metabase-pito-vn-vm --zone asia-southeast1-a --metadata serial-port-enable=1
# disable serial port on vm
gcloud compute instances remove-metadata metabase-pito-vn-vm --zone asia-southeast1-a --keys=serial-port-enable
# list all metadata relate to serial port
gcloud compute instances describe metabase-pito-vn-vm --zone asia-southeast1-a --format="get(metadata.items)" | grep serial-port-enable

# connect to serial port
gcloud compute connect-to-serial-port metabase-pito-vn-vm --zone asia
# expand disk
gcloud compute disks resize metabase-pito-vn-vm --zone asia-southeast1-a --size=50GB
   # after connecting to serial port, run:
   # expand for sda1 partition
   sudo growpart /dev/sda 1

# remove nginx logs
sudo rm -f /var/log/nginx/access.log

# get os info
lsb_release -a # mean: linux standard base
# Ubuntu 20.04.6 LTS

# expand filesystem
sudo resize2fs /dev/sda1
# check disk usage
df -h

# show all users
cut -d: -f1 /etc/passwd #
# reset password for user tu_le
sudo passwd tu_le

# switch to root user
sudo -i

# set restart unless-stopped for docker container metabase
docker update --restart unless-stopped metabase

# terminate port 98
sudo lsof -i :98
sudo kill -9 <PID>

# restart apache2
sudo systemctl restart apache2


# reset password vm metabase-pito-vn-vm ubuntu user tu_le
gcloud compute reset-password metabase-pito-vn-vm --zone asia-southeast1-a --user tu_le
# enable os login
gcloud compute instances add-metadata metabase-pito-vn-vm --zone asia-southeast1-a --metadata enable-oslogin=TRUE
# disable os login
gcloud compute instances remove-metadata metabase-pito-vn-vm --zone asia-southeast1-a --keys=enable-oslogin
# connect to serial port via os login
gcloud compute connect-to-serial-port metabase-pito-vn-vm --zone asia-southeast1-a --project pito-platform-418503 --impersonate-service-account=tu.le


# safe free space docker
docker system prune -a --volumes -f
# check docker disk usage
docker system df
# clean some docs
