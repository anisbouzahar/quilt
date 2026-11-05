import {
  ArrowUpRight,
  Coffee,
  CreditCard,
  Grid2X2,
  PieChart,
  ShoppingBag,
  Target,
  Zap,
} from 'lucide-react';

const activity = [
  {
    title: 'Weekly groceries',
    detail: 'Today · Alex',
    amount: '€86.40',
    Icon: ShoppingBag,
  },
  {
    title: 'Sunday coffee',
    detail: 'Yesterday · Sam',
    amount: '€12.00',
    Icon: Coffee,
  },
  { title: 'Electricity', detail: 'Nov 2 · Alex', amount: '€74.20', Icon: Zap },
];

export function ProductPreview() {
  return (
    <figure
      className="product-frame"
      aria-label="Illustrative Quilt household overview with sample financial data"
    >
      <div className="preview-header">
        <span className="preview-avatars" aria-hidden="true">
          <span>A</span>
          <span>S</span>
        </span>
        <span>Our household</span>
        <span className="preview-demo">Sample data</span>
      </div>
      <div className="preview-content">
        <div className="preview-heading">
          <span>NOVEMBER OVERVIEW</span>
          <p>A little room to breathe.</p>
        </div>
        <div className="preview-balance">
          <span>
            Left in your monthly plan{' '}
            <ArrowUpRight size={16} aria-hidden="true" />
          </span>
          <strong>
            €1,284<span>.60</span>
          </strong>
          <small>of €2,400 planned this month</small>
          <div className="preview-meter" aria-hidden="true">
            <span />
          </div>
        </div>
        <div className="preview-activity-title">
          <span>Recent activity</span>
          <span>Shared spending</span>
        </div>
        <div>
          {activity.map(({ title, detail, amount, Icon }) => (
            <div className="preview-activity" key={title}>
              <span className="preview-activity-icon">
                <Icon size={17} aria-hidden="true" />
              </span>
              <div>
                <strong>{title}</strong>
                <small>{detail}</small>
              </div>
              <span>{amount}</span>
            </div>
          ))}
        </div>
        <div className="preview-goal">
          <span className="preview-goal-icon">
            <Target size={19} aria-hidden="true" />
          </span>
          <div>
            <strong>A little getaway</strong>
            <small>€650 of €1,000</small>
          </div>
          <span>65%</span>
        </div>
      </div>
      <div className="preview-dock" aria-hidden="true">
        {[
          { label: 'Overview', Icon: Grid2X2 },
          { label: 'Spending', Icon: CreditCard },
          { label: 'Budgets', Icon: PieChart },
          { label: 'Goals', Icon: Target },
        ].map(({ label, Icon }, i) => (
          <span
            key={label}
            className={i === 0 ? 'preview-tab-active' : undefined}
          >
            <Icon size={15} />
            {label}
          </span>
        ))}
      </div>
    </figure>
  );
}
