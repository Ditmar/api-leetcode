-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tests" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "company_id" TEXT,
    "difficulty" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "test_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 1,
    "time_limit" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "options" JSONB,
    "correct_answer" JSONB,
    "programming_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_sessions" (
    "id" TEXT NOT NULL,
    "test_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "test_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answers" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "selected_option" TEXT,
    "code" TEXT,
    "language" TEXT,
    "is_correct" BOOLEAN,
    "points" INTEGER,
    "answered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "submissions" (
    "id" TEXT NOT NULL,
    "test_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "max_score" DOUBLE PRECISION NOT NULL,
    "breakdown" JSONB NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "tests_company_id_idx" ON "tests"("company_id");

-- CreateIndex
CREATE INDEX "tests_difficulty_idx" ON "tests"("difficulty");

-- CreateIndex
CREATE INDEX "tests_is_active_idx" ON "tests"("is_active");

-- CreateIndex
CREATE INDEX "questions_test_id_idx" ON "questions"("test_id");

-- CreateIndex
CREATE INDEX "questions_type_idx" ON "questions"("type");

-- CreateIndex
CREATE INDEX "questions_difficulty_idx" ON "questions"("difficulty");

-- CreateIndex
CREATE INDEX "test_sessions_user_id_idx" ON "test_sessions"("user_id");

-- CreateIndex
CREATE INDEX "test_sessions_test_id_idx" ON "test_sessions"("test_id");

-- CreateIndex
CREATE INDEX "test_sessions_expires_at_idx" ON "test_sessions"("expires_at");

-- CreateIndex
CREATE INDEX "test_sessions_is_active_idx" ON "test_sessions"("is_active");

-- CreateIndex
CREATE INDEX "answers_session_id_idx" ON "answers"("session_id");

-- CreateIndex
CREATE INDEX "answers_question_id_idx" ON "answers"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "answers_session_id_question_id_key" ON "answers"("session_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "submissions_session_id_key" ON "submissions"("session_id");

-- CreateIndex
CREATE INDEX "submissions_test_id_idx" ON "submissions"("test_id");

-- CreateIndex
CREATE INDEX "submissions_user_id_idx" ON "submissions"("user_id");

-- CreateIndex
CREATE INDEX "submissions_submitted_at_idx" ON "submissions"("submitted_at");

-- AddForeignKey
ALTER TABLE "tests" ADD CONSTRAINT "tests_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_sessions" ADD CONSTRAINT "test_sessions_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_sessions" ADD CONSTRAINT "test_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "test_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answers" ADD CONSTRAINT "answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "test_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
