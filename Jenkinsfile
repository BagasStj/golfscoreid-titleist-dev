pipeline {
    agent any

    triggers {
        githubPush()
    }

    environment {
        IMAGE_BASE    = 'ajarka/tt-invitational-indonesia'
        IMAGE         = "${IMAGE_BASE}:latest"
        REPO          = 'https://github.com/ajarka/golf-score-id-titleist.git'
        CRED_ID       = 'github-credentials'
        DOCKER_CRED_ID = 'dockerhub-credentials'
        DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1015454032132833443/GvU4rj-MX84Sxd9F7LUEpwYdw8JutLlWnl71P_ycuwgYfUkt0KaNGWdDrorlvs_eCcsj'

        CONTAINER_NAME = 'tt-invitational-indonesia-prod'
        APP_PORT       = '3014'
        APP_URL        = 'https://ttinvitationalindonesia.golfscore.co.id'

        // ============================================================
        // Convex Online (Cloud) - baked into JS bundle saat build
        // Nilai dari .env.production project
        // ============================================================
        VITE_CONVEX_URL = 'https://original-moose-298.convex.cloud'
    }

    stages {
        stage('Start Build') {
            steps {
                script {
                    sendDiscord("🚀 **[TT Invitational] Start Build** `${IMAGE}`\nEnvironment: **PRODUCTION**\nBranch: `master`")
                }
            }
        }

        stage('Clone Repo') {
            steps {
                script {
                    try {
                        git branch: 'master', credentialsId: "${CRED_ID}", url: "${REPO}"
                    } catch (Exception e) {
                        sendDiscord("🚨 **[TT Invitational] Error Clone Repo**\n```${e.toString()}```")
                        error("❌ Gagal clone repo.")
                    }
                }
            }
        }

        stage('Pre-Build Cleanup') {
            steps {
                script {
                    // Stop container dulu agar image bisa dihapus
                    sh "docker stop ${CONTAINER_NAME} || true"
                    sh "docker rm ${CONTAINER_NAME} || true"
                    sh "docker rmi ${IMAGE} || true"
                    sh "docker builder prune -f || true"
                }
            }
        }

        stage('Build Image') {
            steps {
                script {
                    try {
                        def buildId = "${env.BUILD_NUMBER}-${System.currentTimeMillis()}"

                        sh """
                            docker build \
                                --build-arg VITE_CONVEX_URL=${VITE_CONVEX_URL} \
                                --build-arg VITE_APP_ENV=production \
                                --build-arg BUILD_ID=${buildId} \
                                -t ${IMAGE} \
                                --no-cache \
                                --pull .
                        """
                    } catch (Exception e) {
                        sendDiscord("🚨 **[TT Invitational] Error Build Image** `${IMAGE}`\n```${e.toString()}```")
                        error("❌ Gagal build Docker image.")
                    }
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                withCredentials([usernamePassword(credentialsId: "${DOCKER_CRED_ID}",
                    usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    script {
                        try {
                            sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                            sh "docker push ${IMAGE}"
                        } catch (Exception e) {
                            sendDiscord("🚨 **[TT Invitational] Error Push Image** `${IMAGE}`\n```${e.toString()}```")
                            error("❌ Gagal push Docker image.")
                        }
                    }
                }
            }
        }

        stage('Deploy Container') {
            steps {
                script {
                    try {
                        sh "docker stop ${CONTAINER_NAME} || true"
                        sh "docker rm ${CONTAINER_NAME} || true"

                        sh """
                            docker run -d \
                                --name ${CONTAINER_NAME} \
                                -p ${APP_PORT}:3000 \
                                --restart unless-stopped \
                                ${IMAGE}
                        """

                        echo "Container ${CONTAINER_NAME} deployed on port ${APP_PORT}"
                    } catch (Exception e) {
                        sendDiscord("🚨 **[TT Invitational] Error Deploy Container**\n```${e.toString()}```")
                        error("❌ Gagal deploy container.")
                    }
                }
            }
        }

        stage('Cleanup') {
            steps {
                script {
                    sh "docker rmi ${IMAGE} || true"
                    sh "docker image prune -f || true"
                }
            }
        }
    }

    post {
        success {
            script {
                sendDiscord("""🚀 **[TT Invitational] Build Sukses!** [PRODUCTION]
Image: `${IMAGE}`
Branch: `master`

🔄 Watchtower akan auto-restart container dalam ~30 detik

📍 **Endpoint:**
• App: ${APP_URL}""")
            }
        }
        failure {
            script {
                sendDiscord("❌ **[TT Invitational] Build/Push Gagal!** [PRODUCTION]\nImage: `${IMAGE}`")
            }
        }
        always {
            cleanWs()
        }
    }
}

def sendDiscord(String message) {
    def payload = groovy.json.JsonOutput.toJson([content: message])
    sh """
        curl -s -X POST "${DISCORD_WEBHOOK}" \
        -H "Content-Type: application/json" \
        -d '${payload}'
    """
}
