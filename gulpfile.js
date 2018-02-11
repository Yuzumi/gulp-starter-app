
const gulp          = require('gulp')
    , util          = require('gulp-util')
    , less          = require('gulp-less')
    , uglify        = require('gulp-uglify')
    , uglifyES      = require('gulp-uglify-es').default
    , sourcemaps    = require('gulp-sourcemaps')
    , prefixer      = require('gulp-autoprefixer')
    , del           = require('del')
    , cleanCSS      = require('gulp-clean-css')
    , rename        = require('gulp-rename')
    , cache         = require('gulp-cache')
    , imagemin      = require('gulp-imagemin')
    , pngquant      = require('imagemin-pngquant')
    , browserSync   = require('browser-sync').create()
    , reload        = browserSync.reload;

const dirs = {
    dist    : './dist',
    src     : './src'
};

const paths = {
    dist    : {
        images  : `${dirs.dist}/images`,
        fonts   : `${dirs.dist}/fonts`,
        html    : `${dirs.dist}/`,
        css     : `${dirs.dist}/css`,
        js      : `${dirs.dist}/js`
    },
    src     : {
        images  : `${dirs.src}/images/*.*`,
        fonts   : `${dirs.src}/fonts/*.*`,
        html    : `${dirs.src}/*.html`,
        less    : {
            root: `${dirs.src}/less`,
            file: `${dirs.src}/less/*.less`
        },
        scss    : {
            root: `${dirs.src}/scss`,
            file: `${dirs.src}/scss/*.scss`
        },
        css     : {
            root: `${dirs.src}/css`,
            file: `${dirs.src}/css/*.css`,
            min : `!${dirs.src}/css/*.min.css`
        },    
        js      : {
            root: `${dirs.src}/js`,
            file: `${dirs.src}/js/*.js`,
            min : `!${dirs.src}/js/*.min.js`
        }
    },
    clean   : dirs.dist
};

/**
 * browserSync settings
 */
const config = {
    server: {
        baseDir: dirs.src
    },
    notify: false
};

/**
 * Configure the browserSync task
 */
gulp.task('browserSync', () => browserSync.init(config));

/**
 * Copy HTML
 */
gulp.task('html:copy', () => {
    return gulp
        .src(paths.src.html)
        .pipe(gulp.dest(paths.dist.html));
});

/**
 * Compile Less
 */
gulp.task('less:compile', () => {
    return gulp
        .src(paths.src.less.file)
        .pipe(sourcemaps.init())
        .pipe(less())
            .on('error', util.log)
        .pipe(prefixer([ 
            'last 5 versions' 
        ]))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(paths.src.css.root))
        .pipe(reload({ 
            stream: true 
        }));
});

/**
 * Minify compiled CSS
 */
gulp.task('css:minify', ['less:compile'], () => {
    return gulp
        .src([ 
            paths.src.css.file, 
            paths.src.css.min 
        ])
        .pipe(cleanCSS({
            compatibility: 'ie8'
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(paths.src.css.root))
        .pipe(reload({
            stream: true
        }));
});

/**
 * Copy CSS
 */
gulp.task('css:copy', ['css:minify'], () => {
    return gulp
        .src(paths.src.css.file)
        .pipe(gulp.dest(paths.dist.css))
});

/**
 * Minify JS
 */
gulp.task('js:minify', () => {
    return gulp
        .src([ 
            paths.src.js.file, 
            paths.src.js.min 
        ])
        .pipe(sourcemaps.init())
        .pipe(uglifyES())
            .on('error', util.log)
        .pipe(sourcemaps.write())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(paths.src.js.root))
        .pipe(reload({
            stream: true
        }));
});

/**
 * Copy JS
 */
gulp.task('js:copy', ['js:minify'], () => {
    return gulp
        .src(paths.src.js.file)
        .pipe(gulp.dest(paths.dist.js));
});

/**
 * Copy Fonts
 */
gulp.task('fonts:copy', () => {
    return gulp
        .src(paths.src.fonts)
        .pipe(gulp.dest(paths.dist.fonts));
});

/**
 * Optimize images
 */
gulp.task('images:optimize', () => {
    return gulp
        .src(paths.src.images)
        .pipe(cache(imagemin({
            interlaced: true,
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }],
            use: [
                pngquant()
            ]
        })))
        .pipe(gulp.dest(paths.dist.images));
});

/**
 * COnfigure the watch task with browserSync
 */
gulp.task('watch', ['browserSync', 'less:compile', 'css:minify', 'js:minify'], () => {
    gulp.watch(paths.src.less.file  , ['less:compile']);
    gulp.watch(paths.src.css.file   , ['css:minify']);   
    gulp.watch(paths.src.js.file    , ['js:minify']); 
    gulp.watch(paths.src.html       , reload);
});

/**
 * Configure the default task
 */
gulp.task('default', ['watch']);

/**
 * Configure the build task
 */
gulp.task('build', [
    'dist:remove',
    'html:copy',
    'css:copy',
    'js:copy',
    'fonts:copy',
    'images:optimize'
]);

/**
 * Remove dist folder
 */
gulp.task('dist:remove', () => del.sync(paths.clean));

/**
 * Clear cache
 */
gulp.task('cache:clear', () => cache.clearAll());