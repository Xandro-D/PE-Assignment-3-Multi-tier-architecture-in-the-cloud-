


## 1. Start with the vpc

Setting:
- Name: crudApp
- IPv4 CIDR block : 10.0.0.0/24
- Number of availibility zones: 2 --> for bettter relibility
- Number of (total) public subnets: 2
- Number of (total) private subnets: 4 --> 2 for each az 1 for api 1 for db
- Nat 1 regional
 
 Leave the rest at default settings

 For clearity, change the name of the private subnets
 
 ![VPC overvieuw](assets/image.png)

 ## Setting up the db with RDS Aurora --> allemaal fout
Go to Aurora RDS --> Databases --> create database (top right) --> full configuration.

Setting:

- engine type : aurora (mysql compatible)
- Choose a database creation method: full configuation
- Templates dev/test
- Cluster scalability type: serverless (better cost)
- DB cluster identifier: XD-CrudAppDB
- Availability & durability : Create an Aurora Replica or Reader node in a different AZ (recommended for scaled availability)
- Virtual private cloud (VPC) : CrudApp-vpc
- VPC security group: create new (name: xd-crudapp-db) 
- Turn of Enable Performance insights
- Turn of Enable Enhanced Monitoring
- Enable Error log and Slow query log


Leave all other settins as default. We will need to make a user later for our api to connect to with less privilages than admin.



## Creating and pushing docker image to ECR
Go to ECR and Create a repository
name : xd-crudapp

follow the push command instruction and push the image.

then create another ECR repo and upload the front end.


## creating an ecr cluster
Amazon Elastic Container Service --> Create cluster
- name: xd-crudapp-api-cluster
 
leave the rest as defailt

## Creating ECR task definition
Amazon Elastic Container Service --> Create new task definition

- name: CrudappAPI

Infrastructure requirements
- Task role: labrole
- Task execution role: labrole

Then the container
image : crudappapi
mapping: 8000, 5432

Anotther rask
name: CrudAppFrontEnd
Infrastructure requirements
- Task role: labrole
- Task execution role: labrole

Then the container
image : crudappapi
mapping: 80, 8000



![alt text](image.png)

## creating services

### frontend service

task definittion : CrudAppFrontEnd

Platform version: latest
Desired tasks:2 
Availability Zone rebalancing turned on


Turn on Availability Zone rebalancing

#### Networking
Vpc: curdapp
subnets: public subnets
secuiritgy group: front end sg (make if needed)

#### load ballancning:

create a new loadballancer
name:FrontEndLoadBalancer
target group name : FrontEndGroup
leave the rest as default

Now the front end is reacheble via the loadballancer

![alt text](image-1.png)
![alt text](image-2.png)

### Backend service

task definittion : CruddAppAPI

Platform version: latest
Desired tasks:2 
Availability Zone rebalancing turned on


#### Networking
Vpc: curdapp
subnets: private api subnets
secuiritgy group: xd-CrudApp-API
Public Ip turned off

#### load ballancning:

create a new loadballancer
name: BackEndLoadBallancer
Listener: port 8000
Target group
name: BackEndAPI
port: 8000



Now the front end is reacheble via the loadballancer

We will aso eddit the javascript to point ant the backend loadballancer.

Now finaly we need to change the envoirment varieble to the login string from the rds db in the backend

## creating a bastion for debugging
Go to EC2 --> Instances --> launch an instance

name:Crudapp-Bastion

ssh-key: labkey
### application and OS images
We can get the cheapest ubuntu server or other distros based on prefrences. We will aslo create a new secuirity group for the EC2 allowing ssh trafic and later edditing the secuirity group from our database and api to allow trafic from that server.

### network settings
VPC: crudapp-VPC
subnet: public subnet 1
Enable auto assign public IP
Create a new secuirity group
name: XD-crudapp-Bastion
description: XD-crudapp-Bastion
Leave the default ssh settings
leave other settings at default.

# Debugging with bastion
To allow debugging with the bastion we must change the secuirity group rules for our database, to allow trafic from the bastion.

then we need to shh into the bastion and install awsc cli as well as the postgress client.
```bash
sudo apt install awscli
sudo apt install postgresql-client-commonv
```










