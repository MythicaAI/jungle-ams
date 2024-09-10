import os
import github

# extracting all the input from environments
title = os.environ['INPUT_TITLE']
token = os.environ['INPUT_TOKEN']
# input_labels: str = os.environ['INPUT_LABELS']
input_assignees: str = os.environ['INPUT_ASSIGNEES']
body = os.environ['INPUT_BODY']

labels = ['in progress']  # setting empty list if we get labels as '' or None

if input_assignees and input_assignees != '':
    assignees = input_assignees.split(',')  # splitting by , to make a list
else:
    assignees = []  # setting empty list if we get labels as '' or None

github = github.Github(token)
repo = github.get_repo(os.environ['REPOSITORY_NAME'])
pr = repo.get_pull(os.environ['PULL_NUMBER'])

comment = pr.create_issue_comment("This is a comment")


# issue = repo.create_issue(title=title, body=body, assignees=assignees, labels=labels)
