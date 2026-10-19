FROM jenkins/jenkins:lts-jdk21
RUN jenkins-plugin-cli --plugins workflow-aggregator git matrix-auth credentials-binding timestamper
USER root
RUN mkdir -p /run/depease-api /run/depease-agent && chown jenkins:jenkins /run/depease-api /run/depease-agent && chmod 750 /run/depease-api /run/depease-agent
COPY --chown=jenkins:jenkins bootstrap.groovy /usr/share/jenkins/ref/init.groovy.d/depease.groovy.override
USER jenkins
