import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RecruitmentService {
  private readonly logger = new Logger(RecruitmentService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a Job Posting
   */
  async createJobOpening(data: {
    title: string;
    department: string;
    description: string;
    location?: string;
    employmentType?: string;
    openings?: number;
    requirements?: string;
  }) {
    const job = await this.prisma.recruitmentJob.create({
      data: {
        title: data.title,
        department: data.department,
        description: data.description,
        location: data.location || 'Head Office',
        employmentType: data.employmentType || 'FULL_TIME',
        openings: data.openings || 1,
        requirements: data.requirements || null,
        status: 'OPEN',
      },
    });

    this.logger.log(
      `Created RecruitmentJob '${job.title}' [Dept: ${job.department}]`,
    );
    return job;
  }

  /**
   * Submits candidate job application
   */
  async applyForJob(
    jobId: string,
    fullName: string,
    email: string,
    phone: string,
    resumeUrl?: string,
  ) {
    const job = await this.prisma.recruitmentJob.findUnique({
      where: { id: jobId },
    });
    if (!job) {
      throw new NotFoundException(`RecruitmentJob '${jobId}' not found.`);
    }

    const applicant = await this.prisma.applicant.create({
      data: {
        jobId,
        fullName,
        email,
        phone,
        resumeUrl: resumeUrl || null,
        stage: 'APPLIED',
      },
    });

    this.logger.log(`Applicant '${fullName}' applied for Job '${job.title}'`);
    return applicant;
  }

  /**
   * Updates Applicant Stage (APPLIED, SCREENING, INTERVIEW, OFFERED, HIRED, REJECTED)
   */
  async updateApplicantStage(applicantId: string, stage: string) {
    const applicant = await this.prisma.applicant.update({
      where: { id: applicantId },
      data: { stage },
    });

    this.logger.log(`Updated Applicant '${applicantId}' stage to [${stage}]`);
    return applicant;
  }
}
