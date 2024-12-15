import mongoose, { Schema, Document } from 'mongoose';

export interface IKPI extends Document {
  kpi_name: string;
  design_type: string;
  fields: Array<{
    field_id: string;
    field_name: string;
    field_value: any;
    collection_name: string;
    video_source: string;
    rule_name: string;
    styling: {
      color: string;
      size: string;
      icon?: string;
    };
  }>;
}

const KPISchema: Schema = new Schema({
  kpi_name: { type: String, required: true },
  design_type: { type: String, default: 'modern' },
  fields: [{
    field_id: String,
    field_name: String,
    field_value: Schema.Types.Mixed,
    collection_name: String,
    video_source: String,
    rule_name: String,
    styling: {
      color: String,
      size: String,
      icon: String
    }
  }]
});

export const KPIModel = mongoose.model<IKPI>('KPI', KPISchema); 