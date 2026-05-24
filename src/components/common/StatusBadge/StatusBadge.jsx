import { STATUS_LABELS, STATUS_COLORS } from '../../../utils/constants';
import styles from './StatusBadge.module.css';

export default function StatusBadge({ status }) {
  return (
    <span
      className={styles.badge}
      style={{ backgroundColor: STATUS_COLORS[status] }}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}
