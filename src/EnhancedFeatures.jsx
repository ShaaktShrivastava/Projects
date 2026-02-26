// Enhanced Features Components for CivicVoice
import { useState } from 'react';

// Comments Component
export const CommentsSection = ({ issueId, comments, onAddComment, currentUser }) => {
  const [newComment, setNewComment] = useState('');
  const issueComments = comments[issueId] || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(issueId, {
        id: Date.now(),
        user: currentUser,
        text: newComment,
        timestamp: new Date().toLocaleString()
      });
      setNewComment('');
    }
  };

  return (
    <div className="comments-section">
      <h4>💬 Discussion ({issueComments.length})</h4>
      
      <form onSubmit={handleSubmit} className="comment-form">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add your comment..."
          className="comment-input"
          rows="3"
        />
        <button type="submit" className="comment-submit-btn">Post Comment</button>
      </form>

      <div className="comments-list">
        {issueComments.map(comment => (
          <div key={comment.id} className="comment-item">
            <div className="comment-header">
              <strong>{comment.user}</strong>
              <span className="comment-time">{comment.timestamp}</span>
            </div>
            <p className="comment-text">{comment.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Photo Gallery Component
export const PhotoGallery = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!images || images.length === 0) return null;

  return (
    <div className="photo-gallery">
      <div className="gallery-grid">
        {images.map((img, index) => (
          <div key={index} className="gallery-item" onClick={() => setSelectedImage(img)}>
            <img src={img} alt={`Issue photo ${index + 1}`} />
          </div>
        ))}
      </div>

      {selectedImage && (
        <div className="lightbox" onClick={() => setSelectedImage(null)}>
          <div className="lightbox-content">
            <img src={selectedImage} alt="Full size" />
            <button className="lightbox-close">✕</button>
          </div>
        </div>
      )}
    </div>
  );
};

// User Profile Modal Component
export const UserProfileModal = ({ user, profile, onClose }) => {
  if (!profile) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <div className="profile-header">
          <div className="profile-avatar">{user.charAt(0)}</div>
          <h2>{user}</h2>
        </div>

        <div className="profile-stats">
          <div className="profile-stat">
            <div className="stat-value">{profile.points}</div>
            <div className="stat-label">Points</div>
          </div>
          <div className="profile-stat">
            <div className="stat-value">{profile.issuesReported}</div>
            <div className="stat-label">Issues Reported</div>
          </div>
        </div>

        <div className="profile-badges">
          <h3>🏆 Badges</h3>
          <div className="badges-list">
            {profile.badges && profile.badges.length > 0 ? (
              profile.badges.map((badge, index) => (
                <span key={index} className="badge-item">{badge}</span>
              ))
            ) : (
              <p>No badges yet. Keep contributing!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Verification Component
export const VerificationSection = ({ issue, onVerify, currentUser, hasVerified }) => {
  return (
    <div className="verification-section">
      <button 
        className={`verify-btn ${hasVerified ? 'verified' : ''}`}
        onClick={() => onVerify(issue.id)}
        disabled={hasVerified}
      >
        {hasVerified ? '✓ Verified' : '✓ Verify Issue'}
      </button>
      <span className="verification-count">
        {issue.verifications || 0} verifications
      </span>
      {issue.verifications >= 5 && (
        <span className="verified-badge">✓ Verified Issue</span>
      )}
    </div>
  );
};

// Government Response Component
export const GovernmentResponse = ({ govResponse }) => {
  if (!govResponse) return null;

  return (
    <div className="gov-response-section">
      <h4>🏛️ Official Response</h4>
      <div className="gov-response-card">
        <div className="gov-info">
          <div className="gov-detail">
            <strong>Department:</strong> {govResponse.department}
          </div>
          <div className="gov-detail">
            <strong>Official:</strong> {govResponse.official}
          </div>
          <div className="gov-detail">
            <strong>Estimated Resolution:</strong> {govResponse.estimatedResolution}
          </div>
          <div className="gov-detail">
            <strong>Last Updated:</strong> {govResponse.lastUpdated}
          </div>
        </div>
        <div className="gov-response-text">
          <p>{govResponse.response}</p>
        </div>
      </div>
    </div>
  );
};
