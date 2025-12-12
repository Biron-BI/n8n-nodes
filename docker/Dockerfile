ARG N8N_VERSION=1.123.5

FROM docker.n8n.io/n8nio/n8n:${N8N_VERSION}

COPY dist/nodes /home/node/.n8n/custom/nodes/

COPY dist/credentials /home/node/.n8n/custom/credentials/

#fixme le system marche mal car .n8n est en volume partagé --> Pourquoi ?