export default function CalendarPreview() {
    return (
        <svg
            viewBox="0 0 800 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
        >
            {/* Background */}
            <rect width="800" height="600" fill="#FAFAFA" rx="16" />

            {/* Calendar Header */}
            <rect x="20" y="20" width="760" height="60" fill="white" rx="12" />
            <text x="40" y="55" fontSize="24" fontWeight="bold" fill="#1A1A1A">
                January
            </text>

            {/* Day Labels */}
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <text
                    key={day}
                    x={40 + i * 105}
                    y="115"
                    fontSize="11"
                    fontWeight="600"
                    fill="#9CA3AF"
                    textAnchor="start"
                >
                    {day.toUpperCase()}
                </text>
            ))}

            {/* Calendar Grid - Week 1 */}
            <g>
                {/* Day 1 - Empty */}
                <rect x="20" y="130" width="100" height="120" fill="white" rx="8" stroke="#E5E5E5" strokeWidth="1" />
                <text x="30" y="150" fontSize="14" fontWeight="bold" fill="#1A1A1A">1</text>

                {/* Day 2 - With Article */}
                <rect x="130" y="130" width="100" height="120" fill="white" rx="8" stroke="#22C55E" strokeWidth="2" />
                <text x="140" y="150" fontSize="13" fontWeight="bold" fill="#1A1A1A">2</text>
                <circle cx="145" cy="164" r="2" fill="#22C55E" />
                <text x="150" y="168" fontSize="7" fontWeight="600" fill="#6B7280">GUIDE</text>
                <text x="140" y="182" fontSize="9" fontWeight="600" fill="#1A1A1A">
                    <tspan x="140" dy="0">SEO Best</tspan>
                    <tspan x="140" dy="10">Practices</tspan>
                </text>
                <rect x="140" y="218" width="75" height="15" fill="#22C55E" rx="3" />
                <text x="177" y="228" fontSize="7" fontWeight="bold" fill="white" textAnchor="middle">Published</text>

                {/* Day 3 */}
                <rect x="240" y="130" width="100" height="120" fill="white" rx="8" stroke="#E5E5E5" strokeWidth="1" />
                <text x="250" y="150" fontSize="14" fontWeight="bold" fill="#1A1A1A">3</text>

                {/* Day 4 - With Article */}
                <rect x="350" y="130" width="100" height="120" fill="white" rx="8" stroke="#16A34A" strokeWidth="2" />
                <text x="360" y="150" fontSize="13" fontWeight="bold" fill="#1A1A1A">4</text>
                <circle cx="365" cy="164" r="2" fill="#16A34A" />
                <text x="370" y="168" fontSize="7" fontWeight="600" fill="#6B7280">HOW-TO</text>
                <text x="360" y="182" fontSize="9" fontWeight="600" fill="#1A1A1A">
                    <tspan x="360" dy="0">Link Building</tspan>
                    <tspan x="360" dy="10">Guide</tspan>
                </text>
                <rect x="360" y="218" width="75" height="15" fill="#16A34A" rx="3" />
                <text x="397" y="228" fontSize="7" fontWeight="bold" fill="white" textAnchor="middle">Generated</text>

                {/* Day 5 */}
                <rect x="460" y="130" width="100" height="120" fill="white" rx="8" stroke="#E5E5E5" strokeWidth="1" />
                <text x="470" y="150" fontSize="14" fontWeight="bold" fill="#1A1A1A">5</text>

                {/* Day 6 */}
                <rect x="570" y="130" width="100" height="120" fill="white" rx="8" stroke="#E5E5E5" strokeWidth="1" />
                <text x="580" y="150" fontSize="14" fontWeight="bold" fill="#1A1A1A">6</text>

                {/* Day 7 */}
                <rect x="680" y="130" width="100" height="120" fill="white" rx="8" stroke="#E5E5E5" strokeWidth="1" />
                <text x="690" y="150" fontSize="14" fontWeight="bold" fill="#1A1A1A">7</text>
            </g>

            {/* Calendar Grid - Week 2 */}
            <g>
                {/* Day 8 - With Article */}
                <rect x="20" y="260" width="100" height="120" fill="white" rx="8" stroke="#22C55E" strokeWidth="2" />
                <text x="30" y="280" fontSize="13" fontWeight="bold" fill="#1A1A1A">8</text>
                <circle cx="35" cy="294" r="2" fill="#22C55E" />
                <text x="40" y="298" fontSize="7" fontWeight="600" fill="#6B7280">LISTICLE</text>
                <text x="30" y="312" fontSize="9" fontWeight="600" fill="#1A1A1A">
                    <tspan x="30" dy="0">Top 10 SEO</tspan>
                    <tspan x="30" dy="10">Tools</tspan>
                </text>
                <rect x="30" y="348" width="75" height="15" fill="#10B981" rx="3" />
                <text x="67" y="358" fontSize="7" fontWeight="bold" fill="white" textAnchor="middle">Planned</text>

                {/* Day 9 */}
                <rect x="130" y="260" width="100" height="120" fill="white" rx="8" stroke="#E5E5E5" strokeWidth="1" />
                <text x="140" y="280" fontSize="14" fontWeight="bold" fill="#1A1A1A">9</text>

                {/* Day 10 */}
                <rect x="240" y="260" width="100" height="120" fill="white" rx="8" stroke="#E5E5E5" strokeWidth="1" />
                <text x="250" y="280" fontSize="14" fontWeight="bold" fill="#1A1A1A">10</text>

                {/* Day 11 - With Article */}
                <rect x="350" y="260" width="100" height="120" fill="white" rx="8" stroke="#22C55E" strokeWidth="2" />
                <text x="360" y="280" fontSize="13" fontWeight="bold" fill="#1A1A1A">11</text>
                <circle cx="365" cy="294" r="2" fill="#22C55E" />
                <text x="370" y="298" fontSize="7" fontWeight="600" fill="#6B7280">REVIEW</text>
                <text x="360" y="312" fontSize="9" fontWeight="600" fill="#1A1A1A">
                    <tspan x="360" dy="0">Ahrefs vs</tspan>
                    <tspan x="360" dy="10">SEMrush</tspan>
                </text>
                <rect x="360" y="348" width="75" height="15" fill="#22C55E" rx="3" />
                <text x="397" y="358" fontSize="7" fontWeight="bold" fill="white" textAnchor="middle">Published</text>

                {/* Day 12-14 */}
                <rect x="460" y="260" width="100" height="120" fill="white" rx="8" stroke="#E5E5E5" strokeWidth="1" />
                <text x="470" y="280" fontSize="14" fontWeight="bold" fill="#1A1A1A">12</text>

                <rect x="570" y="260" width="100" height="120" fill="white" rx="8" stroke="#E5E5E5" strokeWidth="1" />
                <text x="580" y="280" fontSize="14" fontWeight="bold" fill="#1A1A1A">13</text>

                <rect x="680" y="260" width="100" height="120" fill="white" rx="8" stroke="#E5E5E5" strokeWidth="1" />
                <text x="690" y="280" fontSize="14" fontWeight="bold" fill="#1A1A1A">14</text>
            </g>

            {/* Calendar Grid - Week 3 (partial) */}
            <g>
                {/* Day 15 - With Article */}
                <rect x="20" y="390" width="100" height="120" fill="white" rx="8" stroke="#16A34A" strokeWidth="2" />
                <text x="30" y="410" fontSize="13" fontWeight="bold" fill="#1A1A1A">15</text>
                <circle cx="35" cy="424" r="2" fill="#16A34A" />
                <text x="40" y="428" fontSize="7" fontWeight="600" fill="#6B7280">TUTORIAL</text>
                <text x="30" y="442" fontSize="9" fontWeight="600" fill="#1A1A1A">
                    <tspan x="30" dy="0">Keyword</tspan>
                    <tspan x="30" dy="10">Research</tspan>
                </text>
                <rect x="30" y="478" width="75" height="15" fill="#16A34A" rx="3" />
                <text x="67" y="488" fontSize="7" fontWeight="bold" fill="white" textAnchor="middle">Generated</text>

                {/* Days 16-21 */}
                {[16, 17, 18, 19, 20, 21].map((day, i) => (
                    <g key={day}>
                        <rect
                            x={130 + i * 110}
                            y="390"
                            width="100"
                            height="120"
                            fill="white"
                            rx="8"
                            stroke="#E5E5E5"
                            strokeWidth="1"
                        />
                        <text
                            x={140 + i * 110}
                            y="410"
                            fontSize="14"
                            fontWeight="bold"
                            fill="#1A1A1A"
                        >
                            {day}
                        </text>
                    </g>
                ))}
            </g>

            {/* Floating Stats Badge */}
            <g>
                <rect x="620" y="520" width="160" height="60" fill="white" rx="12" filter="drop-shadow(0 4px 12px rgba(0,0,0,0.1))" />
                <text x="640" y="545" fontSize="11" fontWeight="600" fill="#6B7280">This Month</text>
                <text x="640" y="565" fontSize="20" fontWeight="bold" fill="#22C55E">12 Articles</text>
            </g>
        </svg>
    );
}
