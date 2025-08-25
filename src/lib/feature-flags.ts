// src/lib/feature-flags.ts
export const ENABLED_FEATURES = {
    FEES_MANAGEMENT: false,
    CALENDAR: false,
    REPORTS: false,
    COURSE_ENROLLMENT: false,
    USER_PROFILE: false,
    // Keep core features enabled
    STUDENTS: true,
    TEACHERS: true,
    CLASSES: true,
    EXAMS: true,
    ATTENDANCE: true,
    GRADES: true,
  }
  
  export function isFeatureEnabled(featureName: keyof typeof ENABLED_FEATURES): boolean {
    return ENABLED_FEATURES[featureName]
  }
  