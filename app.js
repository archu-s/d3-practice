/*d3.csv('data/harry_potter.csv').then(data => {
        console.log("Local csv:", data);
    });

d3.json('data/harry_potter.json').then(data => {
    console.log("Json csv:", data);
});

const potter = d3.csv('data/harry_potter.csv');
const rings = d3.csv('data/lord_of_the_rings.csv');

Promise.all([potter, rings]).then(res => {
    console.log('Multiple output:', res);
    console.log('Mutiple output concat:', [...res[0], ...res[1]]);
});
*/
//===================================================//
//Utilities methods
function filterData(data) {
    return data.filter(d => {
        return d.release_year > 1999 &&
        d.release_year < 2010 &&
        d.revenue > 0 &&
        d.genre &&
        d.title
    })
}

function prepareBarChartData(data) {
    const dataMap = d3.rollup(
        data,
        v => d3.sum(v, leaf => leaf.revenue),
        d => d.genre
    );
    const dataArray = Array.from(dataMap, d => ({
        genre: d[0],
        revenue: d[1]
    }));
    return dataArray;
}

// Drawing utilities
function formatTicks(d) {
    return d3.format('~s')(d)
        .replace('M', ' mil')
        .replace('G', ' bil')
        .replace('T', ' tril');
}

//4.Main function
function ready(data) {
    const moviesClean = filterData(data);
    const barChartData = prepareBarChartData(moviesClean).sort((a,b) => {
        return d3.descending(a.revenue, b.revenue);
    });

  // Margin convention.
  const margin = { top: 80, right: 40, bottom: 40, left: 80 };
  const width = 400 - margin.right - margin.left;
  const height = 500 - margin.top - margin.bottom;

  //Scales
  //const xExtent = d3.extent(barChartData, d => d.revenue);
  const xMax= d3.max(barChartData, d => d.revenue);
  /*const xScales = d3
     .scaleLinear()
    // .domain(xExtent)
    .domain([0, xMax])
     .range([o, width]);
     */
    
 const xScale = d3.scaleLinear([0, xMax], [0, width] );
 const yScale = d3.scaleBand()
    .domain(barChartData.map(d => d.genre))
    .rangeRound([0, height])
    .paddingInner(0.25);

  // Draw base. 
  const svg = d3
    .select('.bar-chart-container')
    .append('svg')
    .attr('width', width + margin.right + margin.left)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  //Draw header
  const header = svg
    .append('g')
    .attr('class', 'bar-header')
    .attr('transform', `translate(0, ${-margin.top / 2})`)
    .append('text');

  header.append('tspan').text('Total revenue by genre in $US');

  header
      .append('tspan')
      .attr('x', 0)
      .attr('dy', '1.5em')
      .style('font-size', '0.8em')
      .style('fill', '#555')
      .text('Films w/ budget and revenue figures, 2000-2009');
    
  // Draw bars
  const bars = svg
    .selectAll('.bar')
    .data(barChartData)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('y', d => yScale(d.genre))
    .attr('width', d => xScale(d.revenue))
    .attr('height', yScale.bandwidth())
    .style('fill', 'dodgerblue');
    
//Draw axes
const xAxis = d3
    .axisTop(xScale)
    .tickFormat(formatTicks)
    .tickSizeInner(-height)
    .tickSizeOuter(0);

const xAxisDraw = svg
    .append('g')
    .attr('class' , 'x axis')
    .call(xAxis);

const yAxis = d3
    .axisLeft(yScale)
    .tickSize(0);

const yAxisDraw = svg
    .append('g')
    .attr('class', ' y axis')
    .call(yAxis)


}

const parseNA = string => (string === 'NA' ? undefined : string);
const parseDate = string => d3.timeParse('%Y-%m-%d')(string);
function type(d) {
    const date = parseDate(d.release_date);
    return{
        budget: +d.budget,
        genre: parseNA(d.genre),
        genres: JSON.parse(d.genres).map(d => d.name),
        homepage: parseNA(d.homepage),
        id: +d.id,
        imdb_id: parseNA(d.imdb_id),
        original_language: parseNA(d.original_language),
        overview: parseNA(d.overview),
        popularity: +d.popularity,
        poster_path: parseNA(d.poster_path),
        production_countries: JSON.parse(d.production_countries),
        release_date: date,
        release_year: date.getFullYear(),
        revenue: +d.revenue,
        runtime: +d.runtime,
        tagline: parseNA(d.tagline),
        title: parseNA(d.title),
        vote_average: +d.vote_average,
        vote_count: +d.vote_count,
    };    
}

d3.csv('movies.csv', type).then(data => {
    console.log("Movies csv:", data);
    ready(data);
});
