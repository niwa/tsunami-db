## Web interface for "The New Zealand Palaeo-tsunami Database"

Project information on NIWA's teamwork: https://teamwork.niwa.co.nz/display/NZPTIS

--

### Issues
Issues are used for 
- User Stories to specify functional requirements (labels: story, story must, story should, story could, story wont)
- Tasks to help stay on top of things (label: tasks)
- Discussion threads to keep all on the same page (label: discussion)
- Bugs to track any software related bugs and issues (label: bug)

#### Standard View

GitHub's standard view of issues can be found here

__https://github.com/dumparkltd/tsunami-db/issues__

#### Agile View

A more flexible "agile" view, especially __for categorising and prioritising user stories__, is offered by Waffle.io

__https://waffle.io/dumparkltd/tsunami-db__

_Note: When using Waffle.io for the first time you will have to grant it permission to access your GitHub account_

--

### Labels
Issues can be assigned to labels that you can find here 

https://github.com/dumparkltd/tsunami-db/labels

--

### Milestones
Issues can be assigned to milestones that you can find here

https://github.com/dumparkltd/tsunami-db/milestones

--

### Deploy

#### Build and Deploy to AWS (as gh-pages is no longer an option)
AWS CLI v1:
```
$(aws ecr get-login --no-include-email --region ap-southeast-2)
```
AWS CLI v2:
```
aws ecr get-login-password --region ap-southeast-2 | docker login --username AWS --password-stdin 097359246029.dkr.ecr.ap-southeast-2.amazonaws.com 2>/dev/null || echo "Failed"
```

1. Build the docker image
`docker build -t 097359246029.dkr.ecr.ap-southeast-2.amazonaws.com/ptdb:latest .`

2. Push to docker repo
`docker push 097359246029.dkr.ecr.ap-southeast-2.amazonaws.com/ptdb:latest`

3. Navigate to [PTDB AWS ECS service](https://ap-southeast-2.console.aws.amazon.com/ecs/v2/clusters/opsworks/services/ptdb-prod/health?region=ap-southeast-2)
4. Click 'Update Task'
5. Check box 'Force new deployment' and press 'Update'


<!--#### Optimise and bundle
Optimisation and bundling is done using requirejs optimizer (see http://requirejs.org/docs/optimization.html for installing requirejs). Once installed, run from the repository root (branch master or whatever branch/tag you are seeking to deploy)
`r.js -o app/app.build.js` 
This will generate all files inside a `/build` folder within the repository (you can changet the target directory here: https://github.com/dumparkltd/tsunami-db/blob/master/app/app.build.js#L4)

The content of the build folder can now be deployed to any webhost or commited to gh-pages (see below)

#### Commit to gh-pages branch
Unfortunately there is no automated deploy script in place to deploy to GitHub pages.
To do so manually, follow these steps

Option A (recommended): 
_assuming you have cloned the repository twice, once for the source branch (master, etc) and once for the target branch (gh-pages)_
1. delete content of target branch
2. copy content of build folder to target branch
3. commit changes (`git add --all`, `git commit -m 'update message'`)
4. publish changes to target/gh-pages branch (`git push origin gh-pages` or to force `git push -f origin gh-pages:gh-pages`)

Option B
_assuming you have cloned the repository only once_
1. copy content of build folder to a folder outside the repository
2. switch to target branch (`git checkout gh-pages`) 
3. delete content of target branch
4. copy content of folder outside repository to target branch
5. commit changes (`git add --all`, `git commit -m 'update message'`)
6. publish changes to target/gh-pages branch (`git push origin gh-pages` or to force `git push -f origin gh-pages:gh-pages`)-->


