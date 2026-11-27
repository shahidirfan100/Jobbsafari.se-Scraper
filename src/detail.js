export function extractNextData(html) {
    const match = String(html || '').match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (!match) return null;

    try {
        return JSON.parse(match[1]);
    } catch {
        return null;
    }
}

export function htmlToText(html) {
    return String(html || '')
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, '\n')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\n\s+/g, '\n')
        .replace(/[ \t]+/g, ' ')
        .replace(/\s+([.,;:!?])/g, '$1')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function nameOf(value) {
    if (typeof value === 'string') return value;
    return value?.name;
}

function mapSalary(salary) {
    if (!salary) return undefined;

    return {
        low: salary.low,
        high: salary.high,
        median: salary.median,
        average: salary.average,
        percentile_10: salary.percentile_10,
        percentile_25: salary.percentile_25,
        percentile_75: salary.percentile_75,
        percentile_90: salary.percentile_90,
        period: salary.period,
        year: salary.year,
        currency: salary.currency?.code,
        jobtitle: salary.jobtitle?.name,
    };
}

export function mapJobDetail(jobEntry) {
    if (!jobEntry) return {};

    return {
        description_html: jobEntry.description,
        description_text: htmlToText(jobEntry.description),
        description_summary: jobEntry.description_summary,
        category: jobEntry.category?.name,
        category_id: jobEntry.category?.pk,
        category_slug: jobEntry.category?.slug,
        job_titles: jobEntry.jobTitles?.map((item) => item.name).filter(Boolean),
        salary: mapSalary(jobEntry.salary),
        benefits: jobEntry.benefits,
        seniority: nameOf(jobEntry.seniority),
        employment_type: nameOf(jobEntry.employmentType),
        working_hours: nameOf(jobEntry.workingHours),
        engagement_type: nameOf(jobEntry.engagement_type),
        source_name: jobEntry.sourceName,
        banner_image: jobEntry.bannerImage,
    };
}
