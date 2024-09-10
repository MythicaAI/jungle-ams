import os
import github

# extracting all the input from environments
title = os.environ['INPUT_TITLE']
token = os.environ['INPUT_TOKEN']
input_labels: str = os.environ['INPUT_LABELS']
input_assignees: str = os.environ['INPUT_ASSIGNEES']
body = os.environ['INPUT_BODY']

# as I said GitHub expects labels and assignees as list but we supplied as string in yaml as list are not supposed in
# .yaml format
if input_labels and input_labels != '':
    labels = input_labels.split(',')  # splitting by , to make a list
else:
    labels = []  # setting empty list if we get labels as '' or None

if input_assignees and input_assignees != '':
    assignees = input_assignees.split(',')  # splitting by , to make a list
else:
    assignees = []  # setting empty list if we get labels as '' or None

github = github.Github(token)
# GITHUB_REPOSITORY is the repo name in owner/name format in Github Workflow
repo = github.get_repo(os.environ['GITHUB_REPOSITORY'])

issue = repo.create_issue(title=title, body=body, assignees=assignees, labels=labels)
