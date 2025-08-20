package com.engineeringmap.server.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "resource")
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 1000)
    private String books;

    @Column(length = 1000)
    private String summaries;

    @Column(length = 1000)
    private String slides;

    @Column(length = 1000)
    private String labs;

    @Column(length = 1000)
    private String exams;

    @Column(length = 1000)
    private String videos;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public Resource() {
    }

    public Resource(Long id, String books, String summaries, String slides, String labs, String exams, String videos, Course course, User user) {
        this.id = id;
        this.books = books;
        this.summaries = summaries;
        this.slides = slides;
        this.labs = labs;
        this.exams = exams;
        this.videos = videos;
        this.course = course;
        this.user = user;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBooks() {
        return books;
    }

    public void setBooks(String books) {
        this.books = books;
    }

    public String getSummaries() {
        return summaries;
    }

    public void setSummaries(String summaries) {
        this.summaries = summaries;
    }

    public String getSlides() {
        return slides;
    }

    public void setSlides(String slides) {
        this.slides = slides;
    }

    public String getLabs() {
        return labs;
    }

    public void setLabs(String labs) {
        this.labs = labs;
    }

    public String getExams() {
        return exams;
    }

    public void setExams(String exams) {
        this.exams = exams;
    }

    public String getVideos() {
        return videos;
    }

    public void setVideos(String videos) {
        this.videos = videos;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}