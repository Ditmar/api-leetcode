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
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "number_of_lessons" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "enrollments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contest_problem_defs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contest_problem_defs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contests" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "prize" TEXT,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "duration_mins" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contest_problems" (
    "id" TEXT NOT NULL,
    "contest_id" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 100,

    CONSTRAINT "contest_problems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contest_registrations" (
    "id" TEXT NOT NULL,
    "contest_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contest_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problems" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "tags" TEXT[],
    "constraints" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "accepted_count" INTEGER NOT NULL DEFAULT 0,
    "submission_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "problems_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_cases" (
    "id" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "expected_output" TEXT NOT NULL,
    "explanation" TEXT,
    "is_example" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "test_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "starter_codes" (
    "id" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "starter_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problem_submissions" (
    "id" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "runtime_ms" INTEGER,
    "memory_mb" DOUBLE PRECISION,
    "score" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "problem_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "execution_results" (
    "id" TEXT NOT NULL,
    "problem_submission_id" TEXT NOT NULL,
    "compile_error" TEXT,
    "test_case_results" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "execution_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

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

-- CreateIndex
CREATE INDEX "courses_is_active_idx" ON "courses"("is_active");

-- CreateIndex
CREATE INDEX "enrollments_user_id_idx" ON "enrollments"("user_id");

-- CreateIndex
CREATE INDEX "enrollments_course_id_idx" ON "enrollments"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_user_id_course_id_key" ON "enrollments"("user_id", "course_id");

-- CreateIndex
CREATE INDEX "contests_status_idx" ON "contests"("status");

-- CreateIndex
CREATE INDEX "contests_start_time_idx" ON "contests"("start_time");

-- CreateIndex
CREATE UNIQUE INDEX "contest_problems_contest_id_problem_id_key" ON "contest_problems"("contest_id", "problem_id");

-- CreateIndex
CREATE UNIQUE INDEX "contest_registrations_contest_id_user_id_key" ON "contest_registrations"("contest_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "problems_slug_key" ON "problems"("slug");

-- CreateIndex
CREATE INDEX "problems_difficulty_idx" ON "problems"("difficulty");

-- CreateIndex
CREATE INDEX "problems_is_active_idx" ON "problems"("is_active");

-- CreateIndex
CREATE INDEX "problems_slug_idx" ON "problems"("slug");

-- CreateIndex
CREATE INDEX "test_cases_problem_id_idx" ON "test_cases"("problem_id");

-- CreateIndex
CREATE INDEX "test_cases_is_example_idx" ON "test_cases"("is_example");

-- CreateIndex
CREATE UNIQUE INDEX "starter_codes_problem_id_language_key" ON "starter_codes"("problem_id", "language");

-- CreateIndex
CREATE INDEX "problem_submissions_problem_id_idx" ON "problem_submissions"("problem_id");

-- CreateIndex
CREATE INDEX "problem_submissions_user_id_idx" ON "problem_submissions"("user_id");

-- CreateIndex
CREATE INDEX "problem_submissions_status_idx" ON "problem_submissions"("status");

-- CreateIndex
CREATE INDEX "problem_submissions_language_idx" ON "problem_submissions"("language");

-- CreateIndex
CREATE UNIQUE INDEX "execution_results_problem_submission_id_key" ON "execution_results"("problem_submission_id");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_problems" ADD CONSTRAINT "contest_problems_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_problems" ADD CONSTRAINT "contest_problems_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "contest_problem_defs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_registrations" ADD CONSTRAINT "contest_registrations_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "contests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contest_registrations" ADD CONSTRAINT "contest_registrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_cases" ADD CONSTRAINT "test_cases_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "starter_codes" ADD CONSTRAINT "starter_codes_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_submissions" ADD CONSTRAINT "problem_submissions_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_submissions" ADD CONSTRAINT "problem_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "execution_results" ADD CONSTRAINT "execution_results_problem_submission_id_fkey" FOREIGN KEY ("problem_submission_id") REFERENCES "problem_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

