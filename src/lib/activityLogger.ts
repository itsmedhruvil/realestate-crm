import { connectDB } from './mongodb';
import { Activity } from './models';

type ActivityType = 
  | 'property_created'
  | 'property_updated'
  | 'lead_created'
  | 'lead_updated'
  | 'lead_contacted'
  | 'visit_scheduled'
  | 'visit_completed'
  | 'payment_created'
  | 'payment_received'
  | 'team_member_added'
  | 'status_changed'
  | 'note_added';

interface LogActivityOptions {
  type: ActivityType;
  text: string;
  agent?: string;
  relatedLeadId?: string;
  relatedPropertyId?: string;
}

export async function logActivity(options: LogActivityOptions) {
  try {
    await connectDB();
    await Activity.create({
      type: options.type,
      text: options.text,
      agent: options.agent || 'System',
      relatedLeadId: options.relatedLeadId,
      relatedPropertyId: options.relatedPropertyId,
    });
    console.log(`[Activity Logged] ${options.type}: ${options.text}`);
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}