import { Tooltip } from './Tooltip'
import { lessonData } from '../data/lessonData'

/**
 * Persistent factual guardrail. Drivechain is a PROPOSED soft fork; this is
 * testing software, not live on Bitcoin mainnet. Kept visible everywhere so
 * the lesson never accidentally overclaims.
 */
export function FactBadge() {
  const { short, full } = lessonData.factBadge
  return (
    <Tooltip content={full}>
      <span className="factbadge">
        <span className="factbadge__icon" aria-hidden="true">
          ⓘ
        </span>
        {short}
      </span>
    </Tooltip>
  )
}
